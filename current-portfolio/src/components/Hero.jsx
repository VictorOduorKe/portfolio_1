import React from "react";
import pic1 from "./../assets/profile1.jpg";
import github_pic from "./../assets/github.png";
import my_cv from "../assets/my-cv.pdf"
const Hero = () => {
  return (
    <>
      <section className="hero" id="hero">
        <div className="left">
          <p>
            I am{" "}
            <span>
              <strong>Victor,</strong>{" "}
            </span>
            a passionate Frontend Developer crafting seamless and interactive
            web experiences. I specialize in modern frameworks like React,
            JavaScript, and responsive design to bring ideas to life.{" "}
            <strong> Let's build amazing projects together!</strong>
          </p>
          <div className="link-area">
            <a href="https://github.com/VictorOduorKe" target="_blank">
              <img src={github_pic} alt="" /> ➡
            </a>
            <a href={my_cv} target="_blank" download={"my-cv.pdf"}>
              download cv
            </a>
          </div>

        </div>
        <div className="right">
          <img src={pic1} alt="Profile pic" />
        </div>
      </section>
    </>
  );
};

export default Hero;
