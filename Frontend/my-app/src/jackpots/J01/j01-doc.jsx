//Standard
import React, {useContext} from "react";

//Language jsons
import doc from "./j01-doc-classifier.json";

//Context
import LanguageContext from "../../language-context";

//Main class
const J01Doc = () => {
    const l = useContext(LanguageContext);
    return(
        <section>
            <article>
                <section>
                    <h1>{doc['intro-title'][l]}</h1>
                    <p>{doc['intro'][l]}</p>
                </section>
            </article>
            <article>
                <h1>{doc['faqs-title'][l]}</h1>
                <h2>{doc['faqs-1-question'][l]}</h2>
                <p>{doc['faqs-1-answer-header'][l]}</p>
                <ul>
                    <li>
                        <p>
                            <b>{doc['faqs-1-answer-list-1'][l][0]}</b> {` ${doc['faqs-1-answer-list-1'][l][1]}`}
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>{doc['faqs-1-answer-list-2'][l][0]}</b> {` ${doc['faqs-1-answer-list-2'][l][1]} `}
                            <a href="/documents/handshake" target="_blank">{doc['faqs-1-answer-list-2'][l][2]}</a>,
                            {` ${doc['faqs-1-answer-list-2'][l][3]}`}
                        </p>
                    </li>
                </ul>
                <p>{doc['faqs-1-answer-footer'][l]}</p>
                <h2>{doc['faqs-2-question'][l]}</h2>
                <p>
                    {`${doc['faqs-2-answer'][l][0]} `}
                    <a href="documents/score&share&fortune" target="_blank">{doc['faqs-2-answer'][l][1]}</a>
                </p>
                <h2>{doc['faqs-3-question'][l]}</h2>
                <p>
                    {doc['faqs-3-answer-header'][l]}
                </p>
                <ul>
                    <li>
                        <p>
                            {`${doc['faqs-3-answer-list-1'][l]}`}
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>{doc['faqs-3-answer-list-2'][l][0]}</b> {` ${doc['faqs-3-answer-list-2'][l][1]}`}
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>{doc['faqs-3-answer-list-3'][l][0]}</b> {` ${doc['faqs-3-answer-list-3'][l][1]}`}
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>{doc['faqs-3-answer-list-4'][l][0]}</b> {` ${doc['faqs-3-answer-list-4'][l][1]}`}
                        </p>
                    </li>
                </ul>
                <h2>{doc['faqs-4-question'][l]}</h2>
                <p>
                    {doc['faqs-4-answer-header'][l]}
                </p>
                <ul>
                    <li>
                        <p>
                            <b>{doc['faqs-4-answer-list-1'][l][0]}</b> {` ${doc['faqs-4-answer-list-1'][l][1]} `}
                            <a href="/documents/privacy" target="_blank">{doc['faqs-4-answer-list-1'][l][2]}</a>
                            {` ${doc['faqs-4-answer-list-1'][l][3]} `}
                            <a href="/documents/steam_profile">{doc['faqs-4-answer-list-1'][l][4]}</a>.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>{doc['faqs-4-answer-list-2'][l][0]}</b> {` ${doc['faqs-4-answer-list-2'][l][1]}`}
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>{doc['faqs-4-answer-list-3'][l][0]}</b> {` ${doc['faqs-4-answer-list-3'][l][1]} `}
                            <a href="/documents/privacy" target="_blank">{doc['faqs-4-answer-list-3'][l][2]}</a>
                            {` ${doc['faqs-4-answer-list-3'][l][3]}`}
                        </p>
                    </li>
                </ul>
            </article>
        </section>
    )
}
export default J01Doc;