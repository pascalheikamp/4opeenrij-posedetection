import React, {useEffect, useRef, useState} from 'react'
import {Camera} from "@mediapipe/camera_utils";
import {
    FilesetResolver,
    HandLandmarker,
    DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
import '../App.css'
import Webcam from "react-webcam";
import kNear from "../kNear.js";
import Board from "../game/components/Board.jsx";

function Game() {


    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const poseNameRef = useRef(null);
    // let lastPrediction = "";
    let prediction;
    let trainPose = false;
    let predictPoseVar = false;
    const drawingUtilsRef = useRef(null);

    let machine = new kNear(3);
    // const [poseData, setPoseData] = useState("")

    let handlandMarker;
    let lastVideoTime = -1;
    let currColumns = [];

    let pose;


    // const onResults = (results) => {
    //     if (!webcamRef.current?.video || !canvasRef.current) return
    //     const videoWidth = webcamRef.current.video.videoWidth;
    //     const videoHeight = webcamRef.current.video.videoHeight;
    //     canvasRef.current.width = videoWidth;
    //     canvasRef.current.height = videoHeight;
    //
    //     const canvasElement = canvasRef.current;
    //     const canvasCtx = canvasElement.getContext("2d");
    //     if (canvasCtx == null) throw new Error('Could not get context');
    //     canvasCtx.save();
    //     canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    //
    //     //Only overwrite existing pixels
    //     canvasCtx.globalCompositeOperation = 'source-in';
    //     canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    //
    //     //Only overwrite missing pixels
    //     canvasCtx.globalCompositeOperation = 'destination-atop';
    //     canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    function onResults(results) {
        console.log(results);
    }


    useEffect(() => {
        //draw canvas here

        createHandLandmarker().then(detectLandmarks);
        getPosesFromLocalStorage();

    }, []);


    // function drawBoard() {
    //     let canvas = canvasRef.current;
    //     const canvasCtx = canvas.getContext("2d");
    //     canvasCtx.fillStyle = "red";
    //     canvasCtx.fillRect(40,20,600,400);
    // }


    function detectLandmarks() {
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null
        ) {
            if (!webcamRef.current?.video) return
            const canvasElement = canvasRef.current;
            const canvasCtx = canvasElement.getContext("2d");
            const drawingUtils = new DrawingUtils(canvasCtx);
            const camera = new Camera(webcamRef.current.video, {
                onFrame: async () => {
                    if (!webcamRef.current?.video) return
                    let startTimeMs = performance.now();
                    if (lastVideoTime === webcamRef.current.video.currentTime) return
                    lastVideoTime = webcamRef.current.video.currentTime
                    const result = await handlandMarker.detectForVideo(webcamRef.current.video, startTimeMs);
                    canvasCtx.save();
                    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    if (result.landmarks) {
                        pose = result.landmarks
                        // console.log(pose);
                        if (trainPose) {
                            registerPose(poseNameRef.current.value, pose)
                        }
                        if (predictPoseVar) {
                            predictPose(pose);
                        }
                        executePose(prediction)
                        for (const landmark of result.landmarks) {
                            drawingUtils.drawLandmarks(landmark, {
                                radius: 3, color: "green"
                            })
                            drawingUtils.drawConnectors(landmark, HandLandmarker.POSE_CONNECTIONS);
                        }
                        canvasCtx.restore();
                    }
                },
                width: 640,
                height: 480,
            });
            camera.start();
        }
    }

    function registerPose(poseDetection, landmarkResults) {
        if (!landmarkResults[0]) return
        let landmarkResultList = landmarkResults[0]?.flatMap(landmarkPose => [landmarkPose.x, landmarkPose.y]) || [];
        // coordinateList.push(landmarkResultList);

        addToLocalStorage(poseDetection, landmarkResultList)
        // let poseData = {
        //     coordinates: landmarkResultList,
        //     label: poseDetection
        // }

        // localStorage.getItem("coordinates");
        //
        // localStorage.setItem("coordinates", stringifiedPoseData);
        // console.log(poseDetection)

        // localStorage.setItem("poses", landmarkResults);
        // console.log(landmarkResultList);
        // console.log(poseDetection.current.value)
        // console.log(landmarkResults);
    }

    function addToLocalStorage(pose, landmarks) {
        // let list = []
        let poseObj = {
            label: pose ,
            coordinates: landmarks
        }
        // list.push(poseObj);
        // if(!localStorage)
        // let stringifiedData = JSON.stringify(list);
        let storage = localStorage.getItem("coordinates")
        let parsedList = JSON.parse(storage);
        if(parsedList == null) {
            parsedList = [];
        }
        parsedList.push(poseObj);
        let stringifiedList = JSON.stringify(parsedList);
        localStorage.setItem( "coordinates",stringifiedList);
    }

    function getPosesFromLocalStorage() {
        let coordinates = JSON.parse(localStorage.getItem("coordinates"));
        if(!coordinates) return
        for (const coordinate of coordinates) {
            machine.learn(coordinate.coordinates, coordinate.label)
        }
        console.log(coordinates);
    }

    // function spawnPiece() {
    //     let board = boardRef.current;
    //     const piece = React.createElement("div", {className:"piece"});
    //     board.append(piece);
    // }



    function predictPose(results) {
        let landmarkResultList = [];
        if (!results[0]) return
        for (let landmarkPose of results[0]) {
            landmarkResultList.push(landmarkPose.x, landmarkPose.y);
        }
        console.log(landmarkResultList);
        let prediction = machine.classify(landmarkResultList);
        return prediction;
    }

    function executePose(prediction) {
        if(prediction == "RockGane") {
            console.log("start game")
        }
    }

    // function getPosesFromLocalStorage() {
    //     const poses = localStorage.getItem("poses");
    //     console.log(poses);
    // }
    function enableTrainPose() {
        trainPose = !trainPose;
        // for(const landmark of LandmarkResults)
    }

    function enablePredictPose() {
        predictPoseVar = !predictPoseVar;
    }

    function removePoses() {
        localStorage.removeItem("coordinates")
        localStorage.clear();
    }



    const createHandLandmarker = async () => {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        handlandMarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 1
        });
    };


    return (
        <>
            <section className={"container"}>
                <Board/>
                <Webcam ref={webcamRef} style={{
                    position: "absolute",
                    visibility: "hidden",
                    top: 20,
                    marginRight: "auto",
                    marginLeft: "4em",
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    zIndex: 9,
                    width: 640,
                    height: 480
                }}/>
                <canvas ref={canvasRef} style={{
                    top: 120,
                    marginLeft: "auto",
                    marginRight: "auto",
                    left: 0,
                    right: 0,
                    zIndex: 9,
                    position: "absolute",
                    width: 640,
                    height: 480
                }}></canvas>
            </section>
            {/*<div className={"pose-container"}>*/}
            {/*    <div className={"wrapper"}>*/}
            {/*        <label>Name of pose:</label>*/}
            {/*    </div>*/}
            {/*    <input ref={poseNameRef} type={"text"}/>*/}
            {/*    <button onClick={enableTrainPose} className={"button"}>Train pose</button>*/}
            {/*    <button onClick={enablePredictPose} className={"button"}>Predict pose</button>*/}
            {/*    <button onClick={removePoses} className={"button"}>Remove poses</button>*/}
            {/*    /!*<p>The predection is: {prediction}</p>*!/*/}
            {/*</div>*/}
        </>
    )
}

export default Game;

