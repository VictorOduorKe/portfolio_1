import React, { useState } from "react";
import { Link } from "react-scroll";
import my_cv from "../assets/my-cv.pdf"
const Navbar = () => {

  const [menuOpen, setMenuOpen] = useState(false);;

  const togggleMenu=()=>{
    setMenuOpen(!menuOpen);
  }
  return (
    <>
      <header className="navbar">
        <a href="">Victor Oduor</a>
        <nav className={menuOpen?"menu-active":""}>
          <ul>
           
            <li>
              <Link to="languages" smooth={true} duration={600}>
                languages
              </Link>
            </li>
            <li>
              <Link to="skills" smooth={true} duration={600}>
                skill
              </Link>
            </li>
            <li>
              <Link to="projects" smooth={true} duration={600}>
                Projects
              </Link>
            </li>
            <li>
              <Link to="contact" smooth={true} duration={600}>
                Contact
              </Link>
            </li>
            <li><a href={my_cv} download={"my-cv.pdf"}>Download CV</a></li>
          </ul>
        </nav>
          <div className="togle-menu" onClick={togggleMenu}>
            <i className={menuOpen?"fa fa-times":"fa fa-bars"}></i>
          </div>
      </header>
    </>
  );
};

export default Navbar;
