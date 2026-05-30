type Props = {
    title : String;
    amount : number
}
function Expensecard ({ title, amount} : Props){
    return (
        <>
            <h2>{title}</h2>
            <h3>{amount}</h3>
        </>
    )
}

export default Expensecard