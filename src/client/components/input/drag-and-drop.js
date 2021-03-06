const React = require('react');
const Input = require('react-bootstrap').Input;

class DragAndDrop extends React.Component {
	constructor() {
		super();
		this.handleClick = this.handleClick.bind(this);
		this.handleDragOver = this.handleDragOver.bind(this);
		this.handleDrop = this.handleDrop.bind(this);
		this.state = {achievement: {
			name: 'drag badge to set',
			src: '/images/blankbadge.svg'
		}};
	}
	handleClick(ev) {
		ev.preventDefault();
		this.setState({achievement: {
			name: 'drag badge to set',
			src: '/images/blankbadge.svg'
		}});
	}
	handleDragOver(ev) {
		ev.preventDefault();
	}
	addChild(data) {
		this.setState({achievement: data});
	}
	handleDrop(ev) {
		ev.preventDefault();
		let data;

		try {
			data = JSON.parse(ev.dataTransfer.getData('text'));
		}
		catch (err) {
			return;
		}
		this.addChild(data);
	}
	getValue() {
		return this.target.getValue();
	}
	render() {
		return (
			<div className="well col-sm-4"
				onClick={this.handleClick}
				onDragOver={this.handleDragOver}
				onDrop={this.handleDrop}
			>
				<Input
					name={this.props.name}
					type="hidden"
					value={this.state.achievement.id}
				/>
				<img
					className="center-block"
					height="100px"
					src={this.state.achievement.src}
				/>
				<div className="center-block h3">
					{this.state.achievement.name}
				</div>
			</div>
		);
	}
}

DragAndDrop.displayName = 'DragAndDrop';
DragAndDrop.propTypes = {
	name: React.PropTypes.string.isRequired
};

module.exports = DragAndDrop;
