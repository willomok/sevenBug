import { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import '../styles/SideNav.css';

interface SideNavState {
  isOpen: boolean;
}

class SideNav extends Component<{}, SideNavState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  toggleNav = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  closeNav = () => {
    this.setState({ isOpen: false });
  };

  handleOutsideClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.side-nav') && !target.closest('.burger-menu')) {
      this.closeNav();
    }
  };

  componentDidMount() {
    document.addEventListener('mousedown', this.handleOutsideClick);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleOutsideClick);
  }

  render() {
    const { isOpen } = this.state;

    return (
      <>
        <div className="burger-menu" onClick={this.toggleNav} aria-label="Toggle menu">
          <FaBars />
        </div>
        <nav className={`side-nav ${isOpen ? 'open' : ''}`}>
          <ul>
            <li onClick={this.closeNav}>
              <Link to="/">Home</Link>
            </li>
            <li onClick={this.closeNav}>
              <Link to="/user-management">Users</Link>
            </li>
            <li onClick={this.closeNav}>
              <Link to="/profile">Profile</Link>
            </li>
          </ul>
        </nav>
        {isOpen && <div className="backdrop" onClick={this.closeNav} aria-hidden="true"></div>}
      </>
    );
  }
}

export default SideNav;
