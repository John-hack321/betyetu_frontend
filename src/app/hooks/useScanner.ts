import { isAscii } from "buffer"
import { useCallback, useEffect, useRef, useState } from "react"
import jsQR from "jsqr"

// i used this code to learn programming hooks in react


// HOOKS
// so a hook is a javascript function that makes use of react features like state and more

interface UseQRScannerReturn {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    isScanning: boolean;
    scannedCode: string | null;
    error: string | null;
    startScanning: () => Promise<void>;
    stopScanning: () => void;
  }


export const useQrScanner= (): UseQRScannerReturn => {
    // so our hook needs to make use of state
    const [isScanning, setIsScanning]= useState<boolean>(false)
    const [scannedCode, setScannedCode]= useState<string | null >(null)
    const [error, setError]= useState<string | null>(null)

    // we also need refs 
    // we need refs for these : 
    //      the video element to controll the camera feed
    //      the canvas element to analyze frames
    //      the media streamt to stop it later
    //      the animation frame id to cancel the loop

    const videoRef= useRef<HTMLVideoElement>(null)
    // Initially null, will hold reference to <video> element
    // We pass this ref to the component: <video ref={videoRef} />


    const canvasRef= useRef<HTMLCanvasElement>(null)
    // this will hold reference to the canvas element

    const streamRef= useRef<MediaStream | null>(null)
    // Will hold the camera stream so we can stop it later
    // MediaStream is the browser's type for camera/mic streams

    
    const animationFrameRef= useRef<number | null>(null)
    // Will hold the ID returned by requestAnimationFrame
    // We need this ID to cancel the animation loop

    // functions to work with the state and ref data points


    const scanFrame= useCallback(()=> {
        // get the dom element first
        const video= videoRef.current;
        const canvas= canvasRef.current;

        // do a safety check to confirm that we have everyhting we need
        if (!video || !canvas || !isScanning) {
            return; // exit early if not ready
        }

        // get the canvas drawing context
        const canvasContext= canvas.getContext('2d');
        if (!canvasContext) {
            return; // return early
        }

        // make canvas same size as video
        canvas.width= video.videoWidth;
        canvas.height= video.videoHeight;

        // draw the current video frame onto the canvas
        // what this does it it freezes the frame so we can analyze it 
        canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height)

        // extract the pixel data from the canvas
        // this gives us an array of number: [R, G, B,....]
        // each pixel is 4 number (red, green, blue, alpha)

        const imageData= canvasContext.getImageData(
            0, 0, // start at the top left conner
            canvas.width, // full width
            canvas.height // full height
        )

        // pass the pixel data to jsqr to detect qr codes
        const code= jsQR(
            imageData.data,
            imageData.width,
            imageData.height,
            {
                inversionAttempts: "dontInvert" // perfrmance settign
            }
        );

        if (code) {
            // if the code is found in the qr code
            console.log(`the qr code has been found`)
            setScannedCode(code.data); // save the decoded text
            setIsScanning(false); // stop scanning
            stopScanning(); // clean up camera
        } else {
            // no code yet, analyze the next frame
            // requestedAnimationFrame schedules this function to run again
            // on the next screen refresh ( ~60 times per second)
            animationFrameRef.current= requestAnimationFrame(scanFrame)
        }

    }, [isScanning])

    const stopScanning= useCallback(()=> {
        // stop the animation loop
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current= null;
        }

        if (streamRef.current) {
            // a stream can have multiple tracks ( video , audio , etc)
            // stop each one
            streamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            streamRef.current= null;
        }

        // stop the video element too
        if (videoRef.current) {
            videoRef.current.srcObject= null;
        }

        setIsScanning(false)

    },[])

    useEffect(()=> {
        // this runs when dependancies change on component mounts

        return () => {
            // this is the cleanup function 
            stopScanning()
        }
    },[stopScanning])


    const startScanning= useCallback(async ()=> {
        try {
            // reset the state from any previous settings from previous usages
            setError(null)
            setScannedCode(null)

            // request camera access from the browser this will show the allow camera prompt to the user
            const stream=await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: {ideal: 1200},
                    height: {ideal: 720},
                }
            });

            // store the stream so that we can stop it later on
            streamRef.current= stream;

            // connect the stream to our video element
            if (videoRef.current) {
                videoRef.current.srcObject= stream;
                videoRef.current.setAttribute("playsinline", "true");
                await videoRef.current.play();
            }

            setIsScanning(true)

            // start scanning frames after video is ready
            if (videoRef.current) {
                videoRef.current.onloadeddata= ()=> {
                    // this fires when vidoe dimensions are known
                    // now we can start analyzing the frames
                    animationFrameRef.current= requestAnimationFrame(scanFrame)
                };
            }



        } catch (err) {
            console.error("Error accessing the camera:", err)

            if (err instanceof Error) {
                if (err.name === "NotAllowedError") {
                    setError("camera access denied");
                }
                else if (err.name === "NotFoundError") {
                    setError("No camera found");
                }
                else {
                    setError("failed to access camera");
                }
            }
            setIsScanning(false)
        }
    }, [scanFrame]) 

    // we at the end return whaterver we want down here
    return {
        videoRef,
        canvasRef,
        isScanning,
        scannedCode,
        error,
        startScanning,
        stopScanning,
    }
}

// NOTES; 

// in react when the value of the state is changed maybe lets say the value of isscanning is set to true this will cause the rerendering of 
// any component that is using this hook
// then the refs first of all point to the dom element , and they dont cause rerendering of the components that use this hook when they are 
// changed

// after creating the streams and refes the next step is to create functions that use the states and refs
// for most of the functions we need to use the useCallback hook to give us memoized states of the function to prevent unnecesary rerendering 
// of the child componenets

// flow for scanning the qr code:

{/*
```
Component calls startScanning()
  ↓
Request camera permission
  ↓
User allows
  ↓
Stream connects to <video>
  ↓
Video starts playing
  ↓
onloadedmetadata fires
  ↓
scanFrame() is called
  ↓
┌──────────────────┐
│ Frame Loop:      │
│ 1. Draw to canvas│
│ 2. Get pixels    │
│ 3. Check for QR  │
│ 4. If found: stop│
│ 5. Else: repeat  │
└──────────────────┘
  ↓
QR code found!
  ↓
stopScanning() is called
  ↓
Clean up everything
```
*/}

// so why do we need the video frame and canvas , well this is because the jsqr library cannot directly read our video feed from the user
// so we need to take screenshots and analyze , so we us the canvas as a way of taking screenshots and then puting them into jsqr reading them
// and more