interface stakeFilterButtonInterface {
    buttonName: string
    onButtonClick: ()=> void
}

export default function StakeFilterButton({buttonName, onButtonClick}: stakeFilterButtonInterface){
    return(
        <button className='text-sm rounded-full px-3 py bg-lightblue-components font-bold'>
            {buttonName}
        </button>
    )
}