/***********************************************
Sources:
https://opencoursehub.cs.sfu.ca/bfraser/grav-cms/cmpt433/links/files/2019-student-howtos/StreamOpenCVImages.pdf
https://github.com/derekmolloy/boneCV
***********************************************/

#define PORT 12345
#define MAX_LEN 1024

#include "receiver.h"
#include "camera.h"

using namespace std;

static pthread_t receiverID;

static bool isShuttingDown = false;
static int socketDescriptor;
static struct sockaddr_in localSin;
static struct sockaddr_in remoteSin;

static Audio *audio;

static void *receiverRunner(void *arg);

static void replyHandler(const char *command);
static void sendReply(const char *reply);

void startReceiver(Audio *p_audio) {
    audio = p_audio;

    memset(&localSin, 0, sizeof(localSin));
    localSin.sin_family = AF_INET;
    localSin.sin_addr.s_addr = htonl(INADDR_ANY);
    localSin.sin_port = htons(PORT);
    socketDescriptor = socket(PF_INET, SOCK_DGRAM, 0);
    bind(socketDescriptor, (struct sockaddr *)&localSin, sizeof(localSin));
    pthread_create(&receiverID, NULL, receiverRunner, NULL);
}

void stopReceiver(void) {
    isShuttingDown = true;
    pthread_cancel(receiverID);
    pthread_join(receiverID, NULL);
    close(socketDescriptor);
}

void *receiverRunner(void *arg) {
    while (!isShuttingDown) {
        char messageRx[MAX_LEN];
        unsigned int sinLen = sizeof(remoteSin);
        int bytesRx = recvfrom(socketDescriptor,
                               messageRx, MAX_LEN - 1, 0,
                               (struct sockaddr *)&remoteSin, &sinLen);
        messageRx[bytesRx] = '\0';

        replyHandler(messageRx);
    }

    return NULL;
}

static void replyHandler(const char *messageRx) {
    if (strncmp(messageRx, "record", MAX_LEN) == 0) {
        startRecorder();
        sendReply("recording");
    } else if (strncmp(messageRx, "updateFrame", MAX_LEN) == 0) {
        updateFirstInitialFrame();
        sendReply("updating");
    } else if (strncmp(messageRx, "checkForMotion", MAX_LEN) == 0) {
        if (getIsMotionDetected()) {
            sendReply("motion");
        } else {
            sendReply("noMotion");
        }
    } else if (strncmp(messageRx, "startPlayback1", MAX_LEN) == 0) {
        audio->startPlayback("lullaby1.wav");
    } else if (strncmp(messageRx, "startPlayback2", MAX_LEN) == 0) {
        audio->startPlayback("lullaby2.wav");
    } else if (strncmp(messageRx, "stopPlayback", MAX_LEN) == 0) {
        audio->stopPlayback();
    } else if (strncmp(messageRx, "checkForRecording", MAX_LEN) == 0) {
        if (getIsRecording()) {
            sendReply("record");
        } else {
            sendReply("noRecord");
        }
    } else if (strncmp(messageRx, "checkForAudio", MAX_LEN) == 0) {
        if (audio->isAudioDetected()) {
            sendReply("audioDetected");
        } else {
            sendReply("audioNotDetected");
        }
    }
}

static void sendReply(const char *reply) {
    int sinLen = sizeof(remoteSin);
    sendto(socketDescriptor,
           reply, strlen(reply),
           0,
           (struct sockaddr *)&remoteSin, sinLen);
}
