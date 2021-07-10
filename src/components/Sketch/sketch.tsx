import React, { RefObject } from 'react'
import p5 from 'p5'

import { Mediator } from './mediator'
import { Controller } from './controller'

class Sketch extends React.Component {
    private myRef: RefObject<any>;
    private myP5: p5;

    constructor(props: any) {
        super(props)
        //p5 instance mode requires a reference on the DOM to mount the sketch
        //So we use react's createRef function to give p5 a reference
        this.myRef = React.createRef();
        this.myP5 = new p5(this.Sketch, this.myRef.current);
    }

    // This uses p5's instance mode for sketch creation and namespacing
    Sketch = (sk: any) => {
        sk.setup = () => {
            sk.canvas = sk.createCanvas(window.innerWidth, window.innerHeight);
            sk.font_Lato = sk.loadFont("data/fonts/Lato-Light.ttf");
            sk.infoMsg = "MONDRIAN TRANSCRIPTION SOFTWARE\n\nby Ben Rydal Shapiro & contributors\nbuilt with p5.js & JavaScript\n\nHi there! This tool allows you to transcribe fine-grained movement data from video. To get started, use the top buttons to upload a floor plan image file (PNG or JPG) and a video file (MP4). Then, click anywhere on the floorplan to start recording movement data synchronized to the video—as you use your cursor to draw on the floor plan, positioning data is recorded as a CSV file organized by time in seconds and x/y pixel positions scaled to the pixel size of your floor plan image file. Play/pause recording by clicking on the floorplan. On your keyboard press ‘f’ to fast forward and ‘r’ to rewind the video and data recording in 5 second intervals. Use the top buttons to clear your current recording and restart the video or save your recording and record another movement path. For more information, see: https://www.benrydal.com/software/mondrian-transcription";
            sk.mediator = new Mediator(this);
            sk.controller = new Controller(sk.mediator);

            sk.floorPlanContainer = {
                width: sk.width / 2,
                height: sk.height,
                xPos: sk.width / 2,
                yPos: 0
            };

            sk.videoContainer = {
                width: sk.width / 2,
                height: sk.height,
                xPos: 0,
                yPos: 0
            };
        }


        sk.draw = () => {
            if (sk.mediator.allDataLoaded()) {
                if (sk.mediator.getIsRecording()) sk.mediator.updateRecording(); // records data and updates visualization if in record mode
                // If info screen showing, redraw current screen first, then drawKeys
                if (sk.mediator.getIsInfoShowing()) {
                    sk.mediator.updateAllData();
                    sk.drawIntroScreen();
                }
            } else {
                sk.drawLoadDataGUI();
                if (sk.mediator.floorPlanLoaded()) sk.mediator.updateFloorPlan();
                else if (sk.mediator.videoLoaded()) sk.mediator.updateVideoFrame();
                if (sk.mediator.getIsInfoShowing()) sk.drawIntroScreen();
            }
        }

        sk.drawLineSegment = (curPath: any) => {
            // Constrain mouse to floor plan display
            const xPos = this.myP5.constrain(sk.mouseX, sk.floorPlanContainer.xPos, sk.floorPlanContainer.xPos + sk.floorPlanContainer.width);
            const yPos = this.myP5.constrain(sk.mouseY, sk.floorPlanContainer.yPos, sk.floorPlanContainer.yPos + sk.floorPlanContainer.height);
            const pXPos = this.myP5.constrain(sk.pmouseX, sk.floorPlanContainer.xPos, sk.floorPlanContainer.xPos + sk.floorPlanContainer.width);
            const pYPos = this.myP5.constrain(sk.pmouseY, sk.floorPlanContainer.yPos, sk.floorPlanContainer.yPos + sk.floorPlanContainer.height);
            this.myP5.strokeWeight(curPath.weight);
            this.myP5.stroke(curPath.pColor);
            this.myP5.line(xPos, yPos, pXPos, pYPos);
        }

        sk.drawAllPaths = (pathsList: any, curPath: any) => {
            for (const path of pathsList) sk.drawPath(path);
            sk.drawPath(curPath); // draw current path last
        }

        sk.drawPath = (p: any) => {
            sk.stroke(p.pColor);
            sk.strokeWeight(p.weight);
            for (let i = 1; i < p.xPos.length; i++) {
                sk.line(sk.scaleXposToDisplay(p.xPos[i]), sk.scaleYposToDisplay(p.yPos[i]), sk.scaleXposToDisplay(p.xPos[i - 1]), sk.scaleYposToDisplay(p.yPos[i - 1]));
            }
        }

        sk.scaleXposToDisplay = (xPos: number) => {
            return sk.floorPlanContainer.xPos + (xPos / (sk.mediator.getFloorPlanWidth() / sk.floorPlanContainer.width));
        }

        sk.scaleYposToDisplay = (yPos: number)  => {
            return sk.floorPlanContainer.yPos + (yPos / (sk.mediator.getFloorPlanHeight() / sk.floorPlanContainer.height));
        }

        /**
         * Draw current movie frame image and white background to GUI in video display
         */
        sk.drawVideoFrame = (vp: any) => {
            sk.fill(255);
            sk.stroke(255);
            sk.rect(sk.videoContainer.xPos, sk.videoContainer.yPos, sk.videoContainer.width, sk.videoContainer.height);
            sk.image(vp.movieDiv, sk.videoContainer.xPos, sk.videoContainer.yPos, vp.reScaledMovieWidth, vp.reScaledMovieHeight);
        }

        sk.drawVideoTimeLabel = (curMovieTime: number) => {
            sk.fill(0);
            sk.noStroke();
            const labelSpacing = 30;
            const minutes = Math.floor(curMovieTime / 60);
            const seconds = Math.floor(curMovieTime - minutes * 60);
            const label = minutes + " minutes  " + seconds + " seconds";
            sk.text(label, sk.videoContainer.xPos + labelSpacing / 2, sk.videoContainer.yPos + labelSpacing);
        }

        sk.drawFloorPlan = (floorPlan: any) => {
            sk.fill(255); // draw white screen in case floor plan image has any transparency
            sk.stroke(255);
            sk.rect(sk.floorPlanContainer.xPos, sk.floorPlanContainer.yPos, sk.floorPlanContainer.width, sk.floorPlanContainer.height);
            sk.image(floorPlan, sk.floorPlanContainer.xPos, sk.floorPlanContainer.yPos, sk.floorPlanContainer.width, sk.floorPlanContainer.height);
        }

        /**
         * Draws floor plan, video, and key windows
         */
        sk.drawLoadDataGUI = () => {
            sk.noStroke();
            sk.fill(225);
            sk.rect(sk.floorPlanContainer.xPos, sk.floorPlanContainer.yPos, sk.floorPlanContainer.width, sk.floorPlanContainer.height);
            sk.fill(200);
            sk.rect(sk.videoContainer.xPos, sk.videoContainer.yPos, sk.videoContainer.width, sk.videoContainer.height);
        }

        sk.drawIntroScreen = () => {
            const introKeySpacing = 50; // Integer, general spacing variable
            const introTextSize = sk.width / 75;
            sk.rectMode(sk.CENTER);
            sk.stroke(0);
            sk.strokeWeight(1);
            sk.fill(255, 180);
            sk.rect(sk.width / 2, sk.height / 2, sk.width / 2 + introKeySpacing, sk.height / 2 + introKeySpacing);
            sk.fill(0);
            sk.textFont(sk.font_Lato, introTextSize);
            sk.text(sk.infoMsg, sk.width / 2, sk.height / 2, sk.width / 2, sk.height / 2);
            sk.rectMode(sk.CORNER);
        }

        /**
         * Returns scaled mouse x/y position to input floorPlan image file
         */
        sk.getScaledMousePos = (floorPlan: any) => {
            // Constrain mouse to floor plan display and subtract floorPlan display x/y positions to set data to 0, 0 origin/coordinate system
            const x = (sk.constrain(sk.mouseX, sk.floorPlanContainer.xPos, sk.floorPlanContainer.xPos + sk.floorPlanContainer.width)) - sk.floorPlanContainer.xPos;
            const y = (sk.constrain(sk.mouseY, sk.floorPlanContainer.yPos, sk.floorPlanContainer.yPos + sk.floorPlanContainer.height)) - sk.floorPlanContainer.yPos;
            // Scale x,y positions to input floor plan width/height
            const xPos = +(x * (floorPlan.width / sk.floorPlanContainer.width)).toFixed(2);
            const yPos = +(y * (floorPlan.height / sk.floorPlanContainer.height)).toFixed(2);
            return [xPos, yPos];
        }

        /**
         * While wrapped in a P5 instance, this P5 method operates globally on the window (there can't be two of these methods)
         */
        sk.keyPressed = () => {
            if (sk.mediator.allDataLoaded()) {
                if (sk.key === 'r' || sk.key === 'R') sk.mediator.rewind();
                else if (sk.key === 'f' || sk.key === 'F') sk.mediator.fastForward();
            }
        }

        sk.mousePressed = () => {
            if (sk.mediator.allDataLoaded() && sk.overRect(sk.floorPlanContainer.xPos, sk.floorPlanContainer.yPos, sk.floorPlanContainer.width, sk.floorPlanContainer.height)) {
                sk.mediator.playPauseRecording();
                if (sk.mediator.getIsInfoShowing()) sk.mediator.updateIntro(); // prevent info screen from showing while recording for smooth user interaction
            }
        }

        sk.overRect = (x: number, y: number, boxWidth: number, boxHeight: number) => {
            return sk.mouseX >= x && sk.mouseX <= x + boxWidth && sk.mouseY >= y && sk.mouseY <= y + boxHeight;
        }
    }

    getP5Sketch() {
        return this.myP5;
    }
    componentDidMount() {
        //We create a new p5 object on component mount, feed it
        // this.myP5 = new p5(this.Sketch, this.myRef.current)
    }

    render() {
        return (
            //This div will contain our p5 sketch
            <div ref={this.myRef}></div>
        )
    }
}

export default Sketch