// import React from 'react'
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

export default function LandingPage() {
  const router = useNavigate();
  return (
    <div className="landingPageContainer">

        <nav>
            <div className="navHeader">
                <h2>ConferPoint</h2>
            </div>
            <div className="navlist">
              <div role="button" onClick={() => { router("/home")  }}  >
              <p >Join as Guest</p>
              </div>
                
              <div onClick={() => { router("/auth")  }} role="button"><p>Register</p> </div>
                <div onClick={() => { router("/auth")  }} role="button"><p>Login</p></div>
            </div>
        </nav>

        <div className="landingMainContainer">
            <div className="">
                <h1> <span style={{color:"#FF9839"}}>Connect</span> with your loved Ones</h1>
                <p>Cover a distance with ConferPoint</p>
                <div className="" role="button">
                    <Link to={"/auth"} >Get Started</Link>
                </div>
            </div>
            <div className="">
  <img 
    src="/mobile3.png" 
    alt="Mobile Image" 
    style={{ width: '500px', height: 'auto' }} 
  />
</div>

        </div>

    </div>
  )
}
