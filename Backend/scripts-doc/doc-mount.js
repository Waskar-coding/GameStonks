//Local schemas
const Doc = require('../schemas/schema-doc');

//Main function
module.exports = (req, res) => {
    /*
    Mounts document with both language and doc_id specified in req and returns it
    */
    const language = req.query.language;
    const docType = req.query.doc_type;
    const docId = req.params.docId;
    Doc.findOne({_id: docId, doc_type: docType})
        .then(doc => {
            if(doc === null){res.status(404).send({})}
            else{
                const {doc_title, doc_updated} = doc;
                let switcher = false;
                const docHtmlString = doc.doc_sequence.reduce((docString, currentValue) => {
                    /*
                    If the switcher is false the string in currentValue is picked and added to docString.
                    If not the object in currentValue is picked and used to build and image which is then
                    added to docString.
                    Switcher changes in every iteration
                    */
                    if(switcher === false){
                        switcher = true;
                        return docString + currentValue[language]
                    }
                    else{
                        switcher = false;
                        const {image_src, image_alt, image_width} = currentValue;
                        return docString + `<img src='${image_src}' alt='${image_alt}' width='${image_width}' />`
                    }
                }, '');
                res.status(200).send({
                    docId: docId, docTitle: doc_title[language], docDate: doc_updated, docContent: docHtmlString
                })
            }
        })
        .catch((err) => {console.log(err);res.status(500).send({})})
}