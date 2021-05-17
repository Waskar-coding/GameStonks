//Language jsons
import messageDict from '../../language-display/message-classifier.json';

//Main function
const validateSelect = async (value, language) => {
    const requiredError = messageDict['error']['survey-validate-required'][language];
    const {answer} = value;
    switch(value.question_type){
        case 'checkbox': return answer.length === 0? requiredError : '';
        case 'radio': return answer === ''? requiredError : '';
        case 'text':
            if(answer === '') return requiredError;
            let restrictionError = '';
            let applyRestriction = () => {};
            for(let restriction of value.question_restrictions){
                applyRestriction = await import(`./survey-validate-${restriction[0]}`);
                restrictionError = applyRestriction.default(answer, restriction, language);
                if(restrictionError !== "") break;
            }
            return restrictionError;
        default: return 'Required';
    }
}
export default validateSelect;