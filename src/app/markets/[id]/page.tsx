'use client'
import ProtectedRoute from "@/app/components/protectedRoute"
import MenuOverlay from "@/app/components/menuOverlay"
import { fetchMarketDetail, PredictionMarketDetailReturn, MatchPredictionMarketDetailReturn, PredictionMarketGroupDetailReturn } from "@/app/api/predictionMarket"
import { useAuth } from "@/app/context/authContext"
import FooterComponent from "@/app/components/footer"

import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from "react"
import { Menu } from "lucide-react"

// redux data setup
import { RootState , AppDispatch} from "@/app/app_state/store"
import { useSelector , useDispatch} from "react-redux"


// alot of logic is going to be shared amoung these market types here
function FixtureMarketDetail ({marketData}: {marketData: MatchPredictionMarketDetailReturn}) {
    if (!marketData) { // we do this to avoid the instant rendering when the data is set to null at first
        return <div>Loading...</div> 
    }
    return (
        <div>
            <h1>Fixture Market Detail</h1>
        </div>
    )
}

function GroupMarketDetail ({marketData}: {marketData: PredictionMarketGroupDetailReturn}) {
    if (!marketData) {
        return <div>Loading...</div>
    }
    return (
        <div>
            <h1>Group Market Detail</h1>
        </div>
    )
}

function PredictionMarketDetail ({marketData}: {marketData: PredictionMarketDetailReturn}) {
    if (!marketData) {
        return <div>Loading...</div>
    }
    return (
        <div className = "flex flex-col px-3 mt-4 ">
            {/* market details */}
            <div 
            className="flex flex-col gap-4 ">
                <div className = "flex items-center justify-center text-sm px-2 py-1 bg-lightblue-components rounded-full w-fit">
                    <span>{marketData.market.category}</span>
                </div>
                <span
                className="text-lg font-semibold"
                >{marketData.market.question}</span>
            </div>

            {/* our market graph will now go here and any othe details too*/}
            <div className="mt-4">
                <div>
                    <span
                    className="text-lg font-semibold"
                    >{(marketData.market.p_yes * 100).toFixed(0)}% chance</span>
                </div>

                {/* the actaula map graph will now go here : predicion market style like on polymarket*/}
                <div>

                </div>

                {/* amrket handler buttons and volume info */}
                <div>
                    <span>{(marketData.market.total_collected).toFixed(0)} {(marketData.market.total_collected > 1000 ? 'K' : '')}</span>
                    {/* buttons for controlling the timeline will then go here just like on polymarket*/}
                    <div></div>

                </div>

            </div>

            {/* other market stuff */}
            <div>
                {/* rules and notes  */}
                <div className="flex gap-2 flex-col">
                    <span>{marketData.market.description}</span>
                    <span>resolution source: {marketData.market.resolution_source}</span>
                </div>

                {/* we will decide whethe to add an order book or now here : but for now our app is jsut a small app so no need */}
            </div>

            {/* buy and sell buttons here  */}
            <div>
                <button>Buy {(marketData.market.p_yes * 100).toFixed(0)}</button>
                <button>Sell {((1 - marketData.market.p_yes) * 100).toFixed(0)}</button>
            </div>


        </div>
    )
}

function MarketDetailContentRouter (
    {marketType, marketData}: 
    {   marketType: "fixture" | "group" | "prediction" | "", 
        marketData: PredictionMarketDetailReturn | MatchPredictionMarketDetailReturn | PredictionMarketGroupDetailReturn | null}) {
    switch (marketType) {
        case 'fixture':
            return <FixtureMarketDetail marketData={marketData as MatchPredictionMarketDetailReturn} />
        case 'group':
            return <GroupMarketDetail marketData={marketData as PredictionMarketGroupDetailReturn} />
        case 'prediction':
            return <PredictionMarketDetail marketData={marketData as PredictionMarketDetailReturn} />
        default:
            return null
    }
}

function MarketDetailPageInner () {

    const params = useParams()
    const searchParams = useSearchParams()
    
    // local state
    const [menuOpen, setMenuOpen] = useState<boolean>(false)
    const marketId = parseInt(params.id as string)  // gets the 42 from /markets/42
    const marketType = searchParams.get('type')      // gets 'fixture' from ?type=fixture
    const [marketToRender, setMarketToRender] = useState<"fixture" | "group" | "prediction" | "">("") // default to an empty string
    const [marketData, setMarketData] = useState<PredictionMarketDetailReturn | MatchPredictionMarketDetailReturn | PredictionMarketGroupDetailReturn | null>(null)

    const {logout} = useAuth()

    // redux state
    const userData = useSelector((state: RootState) => state.userData)
    const matchData = useSelector((state: RootState) => state.allFixturesData)

    useEffect(()=> {
        const init = async () => {
            try {
                switch (marketType) {
                    case "fixture":
                        setMarketToRender("fixture")
                        const market_detail = await fetchMarketDetail(marketId, "fixture")
                        setMarketData(market_detail!)
                        break
                    case "group":
                        setMarketToRender("group")
                        const group_detail = await fetchMarketDetail(marketId, "group")
                        setMarketData(group_detail!)
                        break
                    case "prediction":
                        setMarketToRender("prediction")
                        const prediction_detail = await fetchMarketDetail(marketId, "prediction")
                        setMarketData(prediction_detail!)
                        console.log(prediction_detail)
                        break
                    default:
                        setMarketToRender("")
                        break
                }
            } catch (err) {
                console.error(err)
            }
        }
        init()
    }, [marketId, marketType])

    console.log(`we got : ${marketId} and ${marketType}`)


    return (
        <div className="flex flex-col h-screen overflow-hidden bg-other-blue-main-background-color">
            {/* Mobile Menu Overlay */}
            <MenuOverlay
                isOpen={menuOpen}
                onClose={() => setMenuOpen(false)}
                onLogoutClick={logout}
                username={userData.username}
                accountBalance={userData.account_balance}
            />

            {/* Header */}
            <div className="flex-none bg-[#1a2633] px-4 pt-4 sm:pb-1 lg:pb-4 md:pb-4 md:px-6 z-20  md:border-none overflow-hidden">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Hamburger — mobile only */}
                        <button
                            onClick={() => setMenuOpen(true)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden"
                        >
                            <Menu className="text-gray-300" size={24} />
                        </button>
                        <h1 className="text-2xl font-bold md:text-3xl">
                            <span className="text-[#FED800]">peer</span>
                            <span className="text-gray-100">stake</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="bg-[#FED800] text-black font-semibold px-4 py-2 rounded-full text-sm shadow-lg hover:bg-[#ffd700] transition-all md:text-base">
                            Deposit
                        </button>

                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden lg:grid lg:grid-cols-[280px_1fr_280px] xl:grid-cols-[320px_1fr_320px] 2xl:grid-cols-[350px_1fr_350px] lg:gap-6 lg:overflow-hidden lg:px-6 lg:pt-6">
            {/* we will decide on how to add the left and reight side bars later on */}


                {/* central content scrollable */}
                <div className="overflow-y-auto hide-vertical-scrollbar pb-24 lg:pb-4  lg:pr-4">
                    <MarketDetailContentRouter marketType={marketType as "fixture" | "group" | "prediction" | ""} marketData={marketData} />
                </div>

            </div>

            {/* Footer — mobile only */}
            <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
                <FooterComponent currentPage={"markets"} publicStakeNumber={matchData.no_of_public_stakes} />
            </div>

        </div>
    )
}

export default function MarketDetailPage() {
    return (
        <ProtectedRoute>
            <MarketDetailPageInner />
        </ProtectedRoute>
    )
}