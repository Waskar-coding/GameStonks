import React, {useCallback} from "react";
import GameBox from "./J01_GameBox";
import PageList from "../../pagination/PageList";
import findMaxPage from "../../pagination/MaxPage";
import SearchForm from "../../search/search-form";
import queryString from "query-string";
import axios from "axios";
import Modal from "react-modal";

Modal.setAppElement("#root");

const GameListOptions = {
    release: "Release date",
    name: "Name",
};


class J01Features extends React.Component{
    constructor(props) {
        super(props);
        if(window.location.toString().search('[?]')!==-1) {
            const query = queryString.parse(`?${window.location.toString().split('?')[1]}`);
            if (
                (query.page !== undefined)
                && (query.sort !== undefined)
                && (query.order !== undefined)
                && (query.search !== undefined)
            ) {
                this.state = {
                    error: null,
                    isLoaded: false,
                    items: [],
                    sort: query.sort,
                    order: query.order,
                    search: query.search,
                    page: query.page,
                    current_number: 1,
                };
            }
            else {
                this.state = {
                    error: null,
                    isLoaded: false,
                    items: [],
                    sort: 'release',
                    order: '1',
                    search: "",
                    page: 1,
                    current_number: 1,
                };
            }
        }
        else{
            this.state={
                error: null,
                isLoaded: false,
                items: [],
                sort: 'release',
                order: '1',
                search: "",
                page: 1,
                current_number: 1,
            };
        }
        this.callbackPage = this.callbackPage.bind(this);
        this.callbackSearch = this.callbackSearch.bind(this);
        this.callbackLoad = this.callbackLoad.bind(this);
    }
    callbackPage(page){
        window.location = (`./features?sort=${this.state.sort}&order=${this.state.order}&page=${page}&search=${this.state.search}`)
    }
    callbackSearch(sort, order, search){
        window.location = (`./features?sort=${sort}&order=${order}&page=1&search=${search}`)
    }
    callbackLoad(current_n, total_n){
        this.setState({
            current_number: current_n,
            total_number: total_n,
            isLoaded: true
        });
    }
    render(){
        const query = queryString.parse(`?${window.location.toString().split('?')[1]}`);
        return(
            <div>
                <SearchForm
                    message={`${this.state.current_number} found games`}
                    options={JSON.stringify(GameListOptions)}
                    toParent={this.callbackSearch}
                    sort={this.state.sort}
                    order={this.state.order}
                    search={this.state.search}
                    placeholder="Search for a game"
                    />
                <GameList
                    jackpotId = {this.props.jackpotId}
                    page={this.state.page}
                    sort={this.state.sort}
                    order={this.state.order}
                    search={this.state.search}
                    toParent={this.callbackLoad}
                    />
                <PageList
                    current={this.state.page}
                    toParent={this.callbackPage}
                    maxpage={findMaxPage(this.state.current_number, this.props.displayPerPage).toString()}
                    />
            </div>
        )
    }
}

class GameList extends React.Component{
  constructor(props) {
      super(props);
      this.state = {
          error: null,
          isLoaded: false,
          items: [],
          total_number: 0,
          displaySubmitModal: false,
          displayInfoModal: false,
          infoData: null,
          submitData: null,
          isModalClickable: true
      };
      this.checkClicked = this.checkClicked.bind(this);
      this.callbackGame = this.callbackGame.bind(this);
      this.submitGame = this.submitGame.bind(this);
      this.cancelGame = this.cancelGame.bind(this);
  }
  componentDidMount(){
      const jackpot = this.props.jackpotId;
      const sort = this.props.sort;
      const order = this.props.order;
      const page = this.props.page;
      const search = this.props.search;
      fetch(`?content=inputs&sort=${sort}&order=${order}&page=${page}&search=${search}`)
          .then(res => res.json())
          .then(
              (res) => {
                  console.log(res);
                  this.setState({
                      isLoaded: true,
                      items: res.active_games,
                      total_number: res.total_n,
                      current_number: res.current_n
                  });
                  if(this.state.current_number===undefined){
                      this.setState({current_number: 0});
                  }
                  this.props.toParent(res.current_n, res.total_n)
              },
              (error) => {
                  this.setState({
                      isLoaded: true,
                      error
                  });
              }
          )
  }
  checkClicked(){
    if(this.state.isModalClickable === true){
        this.submitGame();
        this.setState({
            isModalClickable: false
        });
    }
  }
  submitGame(){
      const postForm = {
          data: this.state.submitData,
          jackpot_id: this.props.jackpotId,
          jackpot_class: 'J01'
      };
      axios.post('./post?action=call', postForm)
          .then( res => {
              this.setState({
                  isLoaded: false
              });
              const sort = this.props.sort;
              const order = this.props.order;
              const page = this.props.page;
              const search = this.props.search;
              this.setState({
                  displaySubmitModal: false,
                  displayInfoModal: true,
                  submitData: null,
              });
              if(res.data.outcome === 'rewarded'){
                  this.setState({
                      infoData: `The game was successfully submitted, your current share is ${res.data.info} $`
                  })
              }
              else if(res.data.outcome === 'kicked'){
                  if(res.data.info + 1 === 1){
                      this.setState({
                          infoData: `The game is not on your steam library, you were kicked from the event and issued a strike. You currently have 1 strike`
                      });
                  }
                  else{
                      this.setState({
                          infoData: `The game is not on your steam library, you were kicked from the event and issued a strike. You currently have ${res.data.info+1} strikes`
                      })
                  }

              }
              fetch(`?content=inputs&sort=${sort}&order=${order}&page=${page}&search=${search}`)
                  .then(res => res.json())
                  .then(
                      (res) => {
                          this.setState({
                              isLoaded: true,
                              items: res.active_games,
                              total_number: res.total_n,
                              current_number: res.current_n,
                              isModalClickable: true
                          });
                          if(this.state.current_number===undefined){
                              this.setState({current_number: 0});
                          }
                          this.props.toParent(res.current_n, res.total_n)
                      },
                      (error) => {
                          this.setState({
                              isLoaded: true,
                              error
                          });
                      }
                  )
          })
          .catch(err => {
              console.log(err);
              this.setState({
                  displaySubmitModal: false,
                  displayInfoModal: true,
                  submitData: null,
                  infoData: 'Internal server error: The game was not submitted',
                  isLoaded: true
              });
          })
  }
  cancelGame(){
      this.setState({
          displaySubmitModal: false,
          submitData: null
      })
  }
  closeInfo(){
      this.setState({
          displayInfoModal: false,
          infoData: null
      })
  }
  callbackGame(appId){
      this.setState({
          displaySubmitModal: true,
          submitData: appId
      });
  }
  render(){
      const {error, isLoaded, items} = this.state;
      const storeImage = require('./steamstorelink.png');
      const statsImage = require('./steamchartslink.png');
      const gameList = (error,isLoaded,items) => {
          if((error) || (items===undefined)){
              return <div class="jackpot_list"><p>Could not load jackpot</p></div>;
          }
          else if((isLoaded) && (items.length!==0)){
              return <div class="J01_gamelist">{ items.map(item => (
                    <GameBox
                        appid = {item.appid}
                        name = {item.name}
                        store = {storeImage}
                        stats = {statsImage}
                        appid = {item.appid}
                        image = {item.thumbnail}
                        release = {item.release}
                        state = {item.registered}
                        toParent = {this.callbackGame}
                      />
                    )
                )}
          </div>;
          }
          else if((items.length===0) && (isLoaded === true)){
              return <div class="jackpot_list"><p>No jackpots found</p></div>;
          }
          else{
              return <div><p>Loading ...</p></div>;
          }
      };
      return(
          <div>
            <Modal isOpen={this.state.displayInfoModal}>
                <div>{this.state.infoData}</div>
                <button onClick={() => {this.closeInfo()}} >Close</button>
            </Modal>
            <Modal isOpen={this.state.displaySubmitModal} contentLabel="Confirm submit">
                <div>
                    <h1>Are you sure you want to submit this game?</h1>
                    <p>
                        By confirming you will accept our terms of privacy. Also the rules of the jackpot
                        which imply that if you do not actually own the game your steam profile will be kicked
                        from this jackpot and issued a strike. Make sure your profile visibility is public to us
                        or your steam profile might be temporally banned from this page.
                    </p>
                </div>
                <button onClick={() => {this.checkClicked()}} >Submit game</button>
                <button onClick={() => {this.cancelGame()}} >Cancel submission</button>
            </Modal>
            <div>{gameList(error,isLoaded,items)}</div>
          </div>)
  }
}

export default J01Features;