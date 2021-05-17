//Standard
import React, {useContext, useState} from "react";

//Local Components
import DisabledChart from "../display-components/disabled-chart";

//Language jsons
import interactiveDict from "../language-display/interactive-classifier.json";
import messageDict from "../language-display/message-classifier.json";

//Context
import LanguageContext from "../context/language-context";

//Main function
const SearchProductRegister = ({products, children}) => {
    const language = useContext(LanguageContext);
    const [currentProduct, setCurrentProduct] = useState(products.length === 0? null : products[0]);
    if(currentProduct === null){
        return(
            <DisabledChart disabledMessage={messageDict['event-personal']['no-products'][language]}>
                {React.cloneElement(children, {product: currentProduct})}
            </DisabledChart>
        )
    }
    else{
        const handleChange = (event) => {
            setCurrentProduct(products.filter(product => {return product.product_id === event.target.value}).pop())
        }
        const productResume = currentProduct.register_data[0];
        return(
            <div>
                <div>
                    <h3>{productResume.name}</h3>
                    <img src={productResume.thumbnail} alt={productResume.name} />
                </div>
                <form>
                    <div>
                        <label id="product">{interactiveDict['product-form']['product-field'][language]}</label>
                        <select id="product" value={currentProduct.product_id} onChange={handleChange}>
                            {products.map(product => {
                                return(
                                    <option key={product.product_id} value={product.product_id}>
                                        {product.register_data[0].name}
                                    </option>
                                )
                            })}
                        </select>
                    </div>
                </form>
                {React.cloneElement(children, {product: currentProduct})}
            </div>
        )
    }
}
export default SearchProductRegister;