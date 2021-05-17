//Standard
import React from "react";
import SimpleList from "../../../display-components/simple-list";

//Main function
const DefaultPersonalHandshakes = ({handshakes}) => {
    return(
        <SimpleList
            title={'Handshakes'}
            list={handshakes.map(handshake => {
                return([
                    <div>
                        <div>
                            <img src={handshake[3]} alt="user thumbnail"/>
                        </div>
                        <div>
                            {handshake[2]}
                        </div>
                        <div>
                            {handshake[0].split('T')[0]}
                        </div>
                    </div>,
                    `/users/profiles/${handshake[1]}`
                ])
            })}
            useLinks={true}
        />
    )
}
export default DefaultPersonalHandshakes;