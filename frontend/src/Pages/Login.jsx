import React, { useEffect, useState } from "react";
import Typewriter from "../Components/Typewriter";
import axios from "../Axios";
import LoginByGoogle from "../Components/LoginByGoogle";
import { useNavigate } from "react-router";

const LoginSignup = () => {
    const [user, setUser] = useState({ email: "", password: "" });
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    const phrases = [
        "Trade smarter, not harder 📉",
        "Where crypto meets opportunity 🚀",
        "Unlock the power of blockchain 🔑",
    ];

    const handleSubmit = async(e) => {
        e.preventDefault();
        if (!user.email || !user.password) {
            alert("Please fill in both email and password to proceed!");
            return;
        }

        try {
            const endpoint = isLogin ? "login" : "register";
            const response = await axios.post(`${endpoint}/`, user);
            
            localStorage.setItem("authToken", response.data?.access_token);
            alert(isLogin ? null: "Signup successful!");
            navigate('/ticker')
            
        } catch (error) {
            alert("Error: " + (error.response?.data?.message || "Something went wrong"));
            
        }
        finally{
            setUser({ email: "", password: "" });
        }

    };

    useEffect(()=>{
        setUser({ email: "", password: "" });
    },[isLogin])

    return (
        <div className="entry-container">
            {/* Left Side */}
            <div className="left-side">
                <div className="welcome-animation">
                    <Typewriter toRotate={phrases} period={2000} />
                </div>
                <p className="welcome-subtitle">
                    Join a world full of adventures, where your imagination shapes the city. 🌟
                </p>
                <div className="floating-elements">
                    <div className="circle circle-1"></div>
                    <div className="circle circle-2"></div>
                    <div className="circle circle-3"></div>
                    <div className="circle circle-4"></div>
                </div>
            </div>

            {/* Right Side */}
            <div className="right-side">
                <div className="login-container">
                    <h2 className="login-title">{isLogin ? "Welcome Back Again" : "Create an Account"}</h2>
                    <form onSubmit={handleSubmit} className="form-group">
                        <div className="input-group">
                            <label className="input-label">
                                <span className="icon">📧</span>Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={user.email}
                                className="input-field"
                                placeholder="Enter your email"
                                onChange={(e) => setUser({ ...user, [e.target.name]: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">
                                <span className="icon">🔑</span> Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={user.password}
                                className="input-field"
                                placeholder="Enter your password"
                                onChange={(e) => setUser({ ...user, [e.target.name]: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-button">
                            {isLogin ? "Login" : "Sign Up"}
                        </button>
                    </form>
                    <p className="toggle-text">
                        {isLogin ? "Don't have an account?" : "Already have an account?"} 
                        <span className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? "Sign up" : "Login"}
                        </span>
                    </p>

                    <div><LoginByGoogle /></div>
                </div>
            </div>
        </div>
    );
};

export default LoginSignup;
