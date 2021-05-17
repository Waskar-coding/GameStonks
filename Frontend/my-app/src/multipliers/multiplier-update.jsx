//Main function
const multiplierUpdate = (apiData, multiplier, multiplierContext) => {
    const {setRegister, available, setAvailable, used, setUsed} = multiplierContext;
    setRegister(apiData.eventRegister);
    setAvailable(
        available.filter(availableMultiplier => {return availableMultiplier !== multiplier})
    );
    setUsed([...used, multiplier]);
}
export default multiplierUpdate;