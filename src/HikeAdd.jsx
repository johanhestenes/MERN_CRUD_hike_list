import React from 'react';

export default class HikeAdd extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.hikeAdd;
    this.props.createHike({
      name: form.name.value,
      created: new Date(),
    });
    // clear the form for the next input
    form.name.value = ''; 
  }

  render() {
    return (
      <div>
        <form name="hikeAdd" onSubmit={this.handleSubmit}>
          <input type="text" name="name" placeholder="Name" />
          <button>Add</button>
        </form>
      </div>
    );
  }
}

HikeAdd.propTypes = {
  createHike: React.PropTypes.func.isRequired,
};