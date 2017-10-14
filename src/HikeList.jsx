import React from 'react';
import 'whatwg-fetch';
import { Link } from 'react-router';

import HikeAdd from './HikeAdd.jsx';

const HikeRow = (props) => {
  function onDeleteClick() {
    props.deleteHike(props.hike._id);
  }

  return (
    <tr>
      <td><Link to={`/hikes/${props.hike._id}`}>{props.hike._id.substr(-4)}</Link></td>
      <td>{props.hike.name}</td>
      <td>{props.hike.distance}</td>
      <td>{props.hike.elevation}</td>
      <td>{props.hike.time}</td>
      <td><button onClick={onDeleteClick}>Delete</button></td>
    </tr>
  );
};

HikeRow.propTypes = {
  hike: React.PropTypes.object.isRequired,
  deleteHike: React.PropTypes.func.isRequired,
};

function HikeTable(props) {
  const hikeRows = props.hikes.map(hike =>
    <HikeRow key={hike._id} hike={hike} deleteHike={props.deleteHike} />
  );
  return (
    <table className="bordered-table">
      <thead>
        <tr>
          <th>Id</th>
          <th>Name</th>
          <th>Distance (miles)</th>
          <th>Elevation Gain (feet)</th>
          <th>Time (hours)</th>
          <th></th>
        </tr>
      </thead>
      <tbody>{hikeRows}</tbody>
    </table>
  );
}

HikeTable.propTypes = {
  hikes: React.PropTypes.array.isRequired,
  deleteHike: React.PropTypes.func.isRequired,
};

export default class HikeList extends React.Component {
  constructor() {
    super();
    this.state = { hikes: [] };

    this.createHike = this.createHike.bind(this);
    this.deleteHike = this.deleteHike.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    const oldQuery = prevProps.location.query;
    const newQuery = this.props.location.query;
    if (oldQuery.status === newQuery.status
        && oldQuery.effort_gte === newQuery.effort_gte
        && oldQuery.effort_lte === newQuery.effort_lte) {
      return;
    }
    this.loadData();
  }

  loadData() {
    fetch(`/api/hikes${this.props.location.search}`).then(response => {
      if (response.ok) {
        response.json().then(data => {
          data.records.forEach(hike => {
            hike.created = new Date(hike.created);
          });
          this.setState({ hikes: data.records });
        });
      } else {
        response.json().then(error => {
          alert(`Failed to fetch hikes ${error.message}`);
        });
      }
    }).catch(err => {
      alert(`Error in fetching data from server: ${err}`);
    });
  }

  createHike(newHike) {
    fetch('/api/hikes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHike),
    }).then(response => {
      if (response.ok) {
        response.json().then(updatedHike => {
          updatedHike.created = new Date(updatedHike.created);
          const newHikes = this.state.hikes.concat(updatedHike);
          this.setState({ hikes: newHikes });
        });
      } else {
        response.json().then(error => {
          alert(`Failed to add hike: ${error.message}`);
        });
      }
    }).catch(err => {
      alert(`Error in sending data to server: ${err.message}`);
    });
  }

  deleteHike(id) {
    fetch(`/api/hikes/${id}`, { method: 'DELETE' }).then(response => {
      if (!response.ok) alert('Failed to delete hike');
      else this.loadData();
    });
  }

  render() {
    return (
      <div>
        <HikeTable hikes={this.state.hikes} deleteHike={this.deleteHike} />
        <hr />
        <HikeAdd createHike={this.createHike} />
      </div>
    );
  }
}

HikeList.propTypes = {
  location: React.PropTypes.object.isRequired,
  router: React.PropTypes.object,
};