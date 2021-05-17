//Standard
import {createContext} from "react";

//Basic profile context
const BasicProfileContext = createContext({isAuth: false, userId: '', steamName: "", steamThumbnail: ""});
export default  BasicProfileContext;