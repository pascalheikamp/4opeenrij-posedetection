import React, {useEffect, useRef, useState} from 'react'
import {Camera} from "@mediapipe/camera_utils";
import {
    FilesetResolver,
    HandLandmarker,
    DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
import './App.css'
import Webcam from "react-webcam";
import kNear from "./kNear.js";
import Board from "./game/components/Board.jsx";
import {Outlet} from "react-router";

function App() {
    return(
        <Outlet></Outlet>
    )
}

export default App

