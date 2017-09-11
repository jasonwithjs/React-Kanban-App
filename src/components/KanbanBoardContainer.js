import React, {Component} from 'react';import update from "react-addons-update";//Polyfillsimport 'babel-polyfill';import 'whatwg-fetch';const API_URL = 'http://kanbanapi.pro-react.com';const API_HEADERS = {	'Content-Type': 'application/json',	Authorization: 'Jason'};class KanbanBoardContainer extends Component {	constructor() {		super(...arguments);		this.state = {			cards: [],		};	}	componentDidMount() {		fetch(`${API_URL}/cards`, {headers: API_HEADERS})			.then((response) => response.json())			.then((responseData) => {				console.log("Data loaded!");				this.setState({cards: responseData});			})			.catch((error) => {				console.log("Error fetching and parsing data", error);			});	}	//三个task回调函数，addTask, deleteTask, toggleTask	//TODO:待解决漏洞：当有几个相同task时，toggleTask总是切换其中第一个task。	addTask(cardId, taskName) {		//获取目标card的索引		let cardIndex = this.state.cards.findIndex((card) => (card.id === cardId));		//使用给出的name和一个临时的id,创建一个task		let newTask = {id: Date.now(), name: taskName, done: false};		//创建一个新对象，将新的 "newTask" Push进去		let nextState = update(this.state.cards, {			[cardIndex]: {				tasks: {$push: [newTask]}			}		});		//使用nextState对象，更新cards的state.		this.setState({cards: nextState});		//调用API，在服务器上更新数据		fetch(`${API_URL}/cards/${cardId}/tasks`, {			method: 'post',			headers: API_HEADERS,			body: JSON.stringify(newTask)		})			.then((response) => response.json())			.then((responseData) => {				newTask.id = responseData.id;				this.setState({cards: nextState});			});		console.log("Task added!")	}	deleteTask(cardId, taskId, taskIndex) {		let cardIndex = this.state.cards.findIndex((card) => (card.id === cardId));		let nextState = update(this.state.cards, {			[cardIndex]: {				tasks: {$splice: [[taskIndex, 1]]}			}		});		this.setState({cards: nextState});		fetch(`${API_URL}/cards/${cardId}/tasks/${taskId}`, {			method: 'delete',			headers: API_HEADERS		});		console.log("Task deleted!")	}	toggleTask(cardId, taskId, taskIndex) {		//搜索对应的索引值		let cardIndex = this.state.cards.findIndex((card) => card.id === cardId);		let newDoneValue;		let nextState = update(this.state.cards, {			[cardIndex]: {				tasks: {					[taskIndex]: {						done: {							$apply: (done) => {								newDoneValue = !done;								return newDoneValue;							}						}					}				}			}		});		this.setState({cards: nextState});		fetch(`${API_URL}/cards/${cardId}/tasks/${taskId}`, {			method: 'put',			headers: API_HEADERS,			body: JSON.stringify({done: newDoneValue})		});		console.log("Task toggled!")	}	//End 三个回调函数	//拖拽实现	updateCardStatus(cardId, listId) {		let cardIndex = this.state.cards.findIndex((card) => card.id === cardId);		let card = this.state.cards[cardIndex];		if (card.status !== listId) {			this.setState(update(this.state, {				cards: {					[cardIndex]: {						status: {$set: listId} //更新card所属的list					}				}			}));		}	}	updateCardPosition(cardId, afterId) {		if (cardId !== afterId) {			// eslint-disable-next-line			let cardIndex = this.state.cards.findIndex((card) => card.id == cardId);			let card = this.state.cards[cardIndex];			// eslint-disable-next-line			let afterIndex = this.state.cards.findIndex((card) => card.id == afterId);			this.setState(update(this.state, {				cards: {					$splice: [						[cardIndex, 1],						[afterIndex, 0, card]					]				}			}));		}	}	//End 拖拽实现	//路由部分的Card方法 addCard和EditCard	addCard(card) {		//state副本		let prevState = this.state;		//临时ID		if (card.id === null) {			card = Object.assign({}, card, {id: Date.now()});		}		//创建一个新对象，并将新Card添加到cards数组中。		let nextState = update(this.state.cards, {$push: [card]});		//更新cards,立即渲染		this.setState({cards: nextState});		fetch(`${API_URL}/cards`, {			method: 'post',			headers: API_HEADERS,			body: JSON.stringify(card)		})			.then((response) => {				if (response.ok) {					return response.json()				} else {					//如果服务器响应失败，返回一个error对象					throw new Error("Server response wasn't OK")				}			})			.then((responseData) => {				//如果服务器返回了一个ID，就在React更新				card.id = responseData.id;				this.setState({cards: nextState});			})			.catch((error) => {				//捕捉到error，就回退到原来的state				this.setState(prevState);			});	}	updateCard(card) {		let prevState = this.state;		//eslint-disable-next-line		let cardIndex = this.state.cards.findIndex((c) => c.id == card.id);		let nextState = update(this.state.cards, {[cardIndex]: {$set: card}});		this.setState({cards: nextState});		fetch(`${API_URL}/cards/${card.id}`, {			method: 'put',			headers: API_HEADERS,			body: JSON.stringify(card)		})			.then((response) => {				if (!response.ok) {					//如果服务器响应失败，返回一个error对象					throw new Error("Server response wasn't OK")				}else{					console.log("card updated!")				}			})			.catch((error) => {				//捕捉到error				console.error("Fetch error:", error);				this.setState(prevState);			});	}	//TODO:添加一个deleteCard()函数	render() {		let kanbanBoard = this.props.children && React.cloneElement(			this.props.children, {				cards: this.state.cards,				taskCallbacks: {					toggle: this.toggleTask.bind(this),					delete: this.deleteTask.bind(this),					add: this.addTask.bind(this)				},				cardCallbacks: {					addCard: this.addCard.bind(this),					updateCard: this.updateCard.bind(this),					updateStatus: this.updateCardStatus.bind(this),					updatePosition: this.updateCardPosition.bind(this),				}			}		);		return kanbanBoard;	}}export default KanbanBoardContainer;