
import React, { useState, useEffect,useContext } from 'react'

import { useGoogleLogin, GoogleLogin } from "@react-oauth/google";
import axios from "../Axios";
import googleLogo from '../assets/google-logo.png'
import { useNavigate } from "react-router";


const LoginByGoogle = () => {

    const navigate = useNavigate();
    const [user, setUser] = useState('');

  


    const sendData = (email) => {
        console.log("SendData ",email);
        axios.post("google-signin/", {
            email: email,
        })
            .then((response) => {
                if (response.data.error === 1) {
                    //  setTermsAndConditionsErr(response.data.erroMsg);
                    toast.error(response.data.erroMsg);
                    console.log("oaisjfaosj");
                    //  setLoader(false);
                } else {
                    console.log("problem");
                    localStorage.setItem("authToken", response.data?.access_token);
                    
                    navigate("/profile");
                    

                    //  setLoader(false);
                }
            }).catch((err) => {
                console.log("err ",err);
                toast.error("Invalid");
                //   setLoader(false);
            });
    }
    const handleGoogleLogin = useGoogleLogin({


        onSuccess: (response) => {
  setUser(response)
          


        },
        onError: (error) => console.log("Login Failed:", error)

        // Handle login success
    });

    useEffect(() => {
        if (user!=='') {
            axios
                .get(
                    `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
                    {
                        headers: {
                            Authorization: `Bearer ${user.access_token}`,
                            Accept: "application/json",
                        },
                    }
                )
                .then((res) => {


                    console.log('---- UserProfile-------');
                    console.log(res.data);
                    sendData(res.data.email)

                })
                .catch((err) => console.log(err));
        }
    }, [user]);

    return (
        <div className="shadow-2xl">
            <div

                className='google_button btn-class'
                type="button"
               
                style={{
                    
                    
                    marginTop:'5px',

                    outline: 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                


                }}

                onClick={handleGoogleLogin}
            >

                <div  title="Sign in With Google" style={{padding:'10px',background:'#1c2427',borderRadius:'10px',cursor:'pointer',
                    display:'flex',justifyContent:'center',alignItems:'center'
                }}>
                    Login With 
                <img  src={googleLogo} style={{ width: '25px', height: '25px',cursor: 'pointer' }} />
                </div>


                

            </div>
        </div>
    );
};

export default LoginByGoogle;