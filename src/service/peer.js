class PeerService {
    constructor() {
        try {
            // Check if no previous peer exists, then create a new one
            if (!this.peer) {
                this.peer = new RTCPeerConnection({
                    iceServers: [
                        {
                            urls: [
                                "stun:stun.l.google.com:19302",
                                "stun:global.stun.twilio.com:3478",
                            ],
                        },
                    ],
                });
            }
        } catch (error) {
            console.error("Error creating peer:", error);
        }
    }

    async getAnswer(offer) {
        try {
            if (this.peer) {
                // Sets the remote description for the peer.
                await this.peer.setRemoteDescription(offer);
                // Creates an answer.
                const answer = await this.peer.createAnswer();
                // Sets the local description.
                await this.peer.setLocalDescription(new RTCSessionDescription(answer));
                return answer;
            }
        } catch (error) {
            console.error("Error getting answer:", error);
        }
    }

    async setLocalDescription(answer) {
        try {
            if (this.peer) {
                // Sets the remote description.
                await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
            }
        } catch (error) {
            console.error("Error setting local description:", error);
        }
    }

    async getOffer() {
        try {
            if (this.peer) {
                // Creates an offer.
                const offer = await this.peer.createOffer();
                // Sets the local description.
                await this.peer.setLocalDescription(new RTCSessionDescription(offer));
                return offer;
            }
        } catch (error) {
            console.error("Error getting offer:", error);
        }
    }
}

export default new PeerService();
