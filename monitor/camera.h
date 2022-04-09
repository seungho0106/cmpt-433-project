#ifndef CAMERA_H
#define CAMERA_H

#include <iostream>
#include <opencv2/imgproc.hpp>
#include <opencv2/opencv.hpp>
#include <opencv2/core/ocl.hpp>
#include <opencv2/tracking.hpp>
#include <nadjieb/mjpeg_streamer.hpp>
#include <unistd.h>
#include <pthread.h>
#include <vector>
#include <iomanip>
#include <ctime>
#include <string>
#include <sstream>

bool startCamera(int time);
void stopCamera(void);
void updateFirstInitialFrame(void);
bool getIsMotionDetected(void);

void startRecorder(void);
void stopRecorder(void);

#endif