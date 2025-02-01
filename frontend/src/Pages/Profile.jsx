import React, { useState, useEffect } from "react";

import axios from "../Axios";

// import "../styles/Profile.css";

const Profile = () => {

    const [user, setUser] = useState({

        photo: "",

        name: "",

        bio: "",

        phone: "",

        email: "",

        password: "",

    });

    const [isEditing, setIsEditing] = useState(false);

    const [file, setFile] = useState(null);

    const [update, setUpdate] = useState(false);

    const [saving, setSaving] = useState(false);

    const getDetail = async () => {

        try {

            const response = await axios.get("get-profile/");

            setUser(response.data);

            setUpdate(true);

        } catch (error) {

            console.error("There was an error fetching the profile data:", error);

        }

    };

    useEffect(() => {

        getDetail();

    }, []);

    const handleChange = (e) => {

        setUser({ ...user, [e.target.name]: e.target.value });

    };

    const handleFileChange = (e) => {

        const selectedFile = e.target.files[0];

        if (selectedFile) {

            setFile(selectedFile);

        }

    };

    const handleSave = async () => {

        setSaving(true);

        setUpdate(false);

        const formData = new FormData();

        formData.append("name", user.name);

        formData.append("bio", user.bio);

        formData.append("phone", user.phone);

        formData.append("email", user.email);

        formData.append("password", user.password);

        if (file) {

            formData.append("image", file);

        }

        try {

            await axios.put("edit-profile/", formData);

            await getDetail();

            setIsEditing(false);

            setSaving(false);

        } catch (error) {

            console.error("There was an error updating the profile:", error);

            setSaving(false);

        }

    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-picture">
                        <img

                            src={user.profile_image || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400"}

                            alt="Profile"

                        />

                        {isEditing && (
                            <label className="edit-overlay" htmlFor="photo-upload">

                                Change Photo
                                <input

                                    id="photo-upload"

                                    type="file"

                                    name="photo"

                                    onChange={handleFileChange}

                                    accept="image/*"

                                />
                            </label>

                        )}
                    </div>
                    
                </div>

                <div className="detail-group">
                    <label>Name</label>
                    <input

                        type="text"

                        name="name"

                        value={user.name}

                        onChange={handleChange}

                        disabled={!isEditing}

                        placeholder="Your Name"

                    />
                </div>

                <div className="detail-group">
                    <label>Bio</label>
                    <textarea

                        name="bio"

                        value={user.bio}

                        onChange={handleChange}

                        disabled={!isEditing}

                        placeholder="Tell us about yourself..."

                    />
                </div>

                <div className="detail-group">
                    <label>Phone</label>
                    <input

                        type="text"

                        name="phone"

                        value={user.phone}

                        onChange={handleChange}

                        disabled={!isEditing}

                        placeholder="Your Phone Number"

                    />
                </div>

                <div className="detail-group">
                    <label>Email</label>
                    <input

                        type="email"

                        name="email"

                        value={user.email}

                        onChange={handleChange}

                        disabled={!isEditing}

                        placeholder="Your Email"

                    />
                </div>

                {isEditing && (
                    <div className="detail-group">
                        <label>Password</label>
                        <input

                            type="password"

                            name="password"

                            value={user.password}

                            onChange={handleChange}

                            placeholder="Enter new password"

                        />
                    </div>

                )}

             

                <div className="button-group">
                    <button

                        className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}

                        onClick={() => setIsEditing(!isEditing)}
                    >

                        {isEditing ? "Cancel" : "Edit Profile"}
                    </button>

                    {isEditing && (
                        <button

                            className={`btn btn-primary ${saving ? 'saving' : ''}`}

                            onClick={handleSave}

                            disabled={saving}
                        >

                            {saving ? "Saving..." : "Save Changes"}
                        </button>

                    )}
                </div>
            </div>
        </div>

    );

};

export default Profile;
