import React from 'react';
import { Link } from 'react-router';

export default class HikeEdit extends React.Component {
  constructor() {
    super();
    this.state = {
      hike: {
        _id: '', elevation: '', name: '', distance: '', time: null, created: null,
      },
      invalidFields: {},
    };
    this.onChange = this.onChange.bind(this);
    this.onValidityChange = this.onValidityChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.params.id !== this.props.params.id) {
      this.loadData();
    }
  }

  onChange(event, convertedValue) {
    const hike = Object.assign({}, this.state.hike);
    const value = (convertedValue !== undefined) ? convertedValue : event.target.value;
    hike[event.target.name] = value;
    this.setState({ hike });
  }

  onValidityChange(event, valid) {
    const invalidFields = Object.assign({}, this.state.invalidFields);
    if (!valid) {
      invalidFields[event.target.name] = true;
    } else {
      delete invalidFields[event.target.name];
    }
    this.setState({ invalidFields });
  }

  onSubmit(event) {
    event.preventDefault();

    if (Object.keys(this.state.invalidFields).length !== 0) {
      return;
    }

    fetch(`/api/hikes/${this.props.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state.hike),
    }).then(response => {
      if (response.ok) {
        response.json().then(updatedHike => {
          updatedHike.created = new Date(updatedHike.created);
          this.setState({ hike: updatedHike });
          alert('Updated hike successfully.');
        });
      } else {
        response.json().then(error => {
          alert(`Failed to update hike: ${error.message}`);
        });
      }
    }).catch(err => {
      alert(`Error in sending data to server: ${err.message}`);
    });
  }

  loadData() {
    fetch(`/api/hikes/${this.props.params.id}`).then(response => {
      if (response.ok) {
        response.json().then(hike => {
          hike.created = new Date(hike.created);
          this.setState({ hike });
        });
      } else {
        response.json().then(error => {
          alert(`Failed to fetch hike: ${error.message}`);
        });
      }
    }).catch(err => {
      alert(`Error in fetching data from server: ${err.message}`);
    });
  }

  render() {
    const hike = this.state.hike;
    const validationMessage = Object.keys(this.state.invalidFields).length === 0 ? null
      : (<div className="error">Please correct invalid fields before submitting.</div>);
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          ID: {hike._id}
          <br />
          Created: {hike.created ? hike.created.toDateString() : ''}
          <br />
          Name: <input name="name" value={hike.name} onChange={this.onChange} />
          <br />
          Distance (miles): <input name="distance" value={hike.distance} onChange={this.onChange} />
          <br />
          Elevation Gain (feet): <input name="elevation" value={hike.elevation} onChange={this.onChange} />
          <br />
          Time (hours): <input name="time" value={hike.time} onChange={this.onChange} />
          <br />
          {validationMessage}
          <button type="submit">Submit</button>
          <Link to="/hikes">Back to hike list</Link>
        </form>
      </div>
    );
  }
}

HikeEdit.propTypes = {
  params: React.PropTypes.object.isRequired,
};