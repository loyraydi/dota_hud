import { useEffect, useRef, useState, useCallback } from "react";

const getMediaMTXBase = () =>
    (window as any).MEDIAMTX_URL || "https://meowhud.ru";

const ICE_SERVERS = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
];

const ICE_GATHER_TIMEOUT = 2000;
const RECONNECT_DELAY = 3000;

async function waitIceGathering(pc: RTCPeerConnection): Promise<void> {
    if (pc.iceGatheringState === "complete") return;
    return new Promise((resolve) => {
        const timeout = setTimeout(resolve, ICE_GATHER_TIMEOUT);
        pc.addEventListener("icegatheringstatechange", function handler() {
            if (pc.iceGatheringState === "complete") {
                clearTimeout(timeout);
                pc.removeEventListener("icegatheringstatechange", handler);
                resolve();
            }
        });
    });
}

async function connectWhep(
    streamName: string,
    videoEl: HTMLVideoElement,
    onConnected: () => void,
    onDisconnected: () => void,
    signal: AbortSignal
): Promise<RTCPeerConnection> {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.addTransceiver("video", { direction: "recvonly" });
    pc.addTransceiver("audio", { direction: "recvonly" });

    pc.ontrack = (event) => {
        if (event.track.kind === "video") {
            videoEl.srcObject = event.streams[0];
            videoEl.play().catch(() => {});
            onConnected();
        }
    };

    pc.onconnectionstatechange = () => {
        if (
            pc.connectionState === "failed" ||
            pc.connectionState === "disconnected"
        ) {
            onDisconnected();
        }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await waitIceGathering(pc);

    if (signal.aborted) {
        pc.close();
        throw new DOMException("Aborted", "AbortError");
    }

    const whepUrl = `${getMediaMTXBase()}/${streamName}/whep`;
    console.log('🎥 connecting WHEP:', whepUrl);
    const response = await fetch(whepUrl, {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: pc.localDescription!.sdp,
        signal,
    });
    console.log('🎥 WHEP response status:', response.status);

    if (!response.ok) {
        pc.close();
        throw new Error(`WHEP ${response.status}: ${whepUrl}`);
    }

    const answerSdp = await response.text();
    await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

    return pc;
}

type Props = {
    streamName: string;
    visible: boolean;
};

const CameraView = ({ streamName, visible }: Props) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [connected, setConnected] = useState(false);

    const cleanup = useCallback(() => {
        if (reconnectRef.current) {
            clearTimeout(reconnectRef.current);
            reconnectRef.current = null;
        }
        abortRef.current?.abort();
        abortRef.current = null;
        pcRef.current?.close();
        pcRef.current = null;
    }, []);

    const connect = useCallback(async () => {
        if (!videoRef.current) return;
        cleanup();
        const ac = new AbortController();
        abortRef.current = ac;
        try {
            const pc = await connectWhep(
                streamName,
                videoRef.current,
                () => setConnected(true),
                () => {
                    setConnected(false);
                    reconnectRef.current = setTimeout(connect, RECONNECT_DELAY);
                },
                ac.signal
            );
            if (!ac.signal.aborted) pcRef.current = pc;
        } catch (err: any) {
            if (err?.name === "AbortError") return;
            reconnectRef.current = setTimeout(connect, RECONNECT_DELAY);
        }
    }, [streamName, cleanup]);

    useEffect(() => {
        connect();
        return cleanup;
    }, [connect, cleanup]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !connected) return;
        if (visible) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    }, [visible, connected]);
    console.log('🎥 CameraView render, streamName:', streamName, 'visible:', visible);
    return (

        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: visible && connected ? 1 : 0,
                pointerEvents: "none",
                transition: "none",
            }}
        />
    );
};

export default CameraView;