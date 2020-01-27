#Libraries
import mongoengine


#Connecting to database
def register_connection(alias: str, db: str) -> None:
	client=mongoengine.connect(alias=alias, db=db)
	return client