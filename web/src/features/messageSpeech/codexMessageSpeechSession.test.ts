// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, it, vi } from "vite-plus/test";
import { createMessageSpeechController } from "./messageSpeech";
import { startCodexVoiceCall, stopCodexVoiceCall } from "../../services/api/codexVoice";

vi.mock("../../services/api/codexVoice", () => ({
  startCodexVoiceCall: vi.fn(),
  stopCodexVoiceCall: vi.fn(async () => ({ ok: true, result: { stopped: true } })),
}));
const sockets = vi.hoisted(
  () =>
    [] as {
      close: ReturnType<typeof vi.fn>;
      emit(message: Record<string, unknown>): void;
      fail(code: string): void;
    }[],
);
vi.mock("../codexVoice/codexVoiceEventSocket", () => ({
  CodexVoiceEventSocket: class {
    close = vi.fn();
    send = vi.fn(() => true);
    connect = vi.fn(async () => {});
    constructor(
      _call: unknown,
      public emit: (message: Record<string, unknown>) => void,
      public fail: (code: string) => void,
    ) {
      sockets.push(this);
    }
  },
}));

const peers: FakePeer[] = [];
const contexts: FakeContext[] = [];
const audios: FakeAudio[] = [];
const track = () => ({ stop: vi.fn() });
class FakeStream {
  constructor(public tracks = [track()]) {}
  getAudioTracks() {
    return this.tracks;
  }
  getTracks() {
    return this.tracks;
  }
}
class FakeContext {
  state = "running";
  resume = vi.fn(async () => {});
  close = vi.fn(async () => {
    this.state = "closed";
  });
  source = {
    offset: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
  destination = { stream: new FakeStream() };
  constructor() {
    contexts.push(this);
  }
  createConstantSource() {
    return this.source;
  }
  createMediaStreamDestination() {
    return this.destination;
  }
}
class FakeAudio {
  srcObject: unknown = null;
  autoplay = false;
  play = vi.fn(async () => {});
  pause = vi.fn();
  setSinkId = vi.fn(async () => {});
  constructor() {
    audios.push(this);
  }
}
class FakePeer {
  iceGatheringState = "complete";
  connectionState = "connected";
  localDescription = { sdp: "test-offer" };
  ontrack: ((event: unknown) => void) | null = null;
  onconnectionstatechange: (() => void) | null = null;
  addTrack = vi.fn();
  close = vi.fn();
  channel = {
    readyState: "open",
    send: vi.fn(),
    close: vi.fn(),
    onmessage: null as ((event: { data: string }) => void) | null,
    onerror: null as (() => void) | null,
    onclose: null as (() => void) | null,
  };
  constructor() {
    peers.push(this);
  }
  createDataChannel() {
    return this.channel;
  }
  createOffer = vi.fn(async () => ({ type: "offer", sdp: "test-offer" }));
  setLocalDescription = vi.fn(async () => {});
  setRemoteDescription = vi.fn(async () => {
    this.ontrack?.({ track: track(), streams: [new FakeStream()] });
  });
  emit(event: unknown) {
    this.channel.onmessage?.({ data: JSON.stringify(event) });
  }
}
const started = (generation = "own-call") => ({
  ok: true as const,
  result: {
    call: {
      provider: "codex" as const,
      generation,
      analyst_generation: null,
      mode: "persona" as const,
      voice: "cove",
      connected: false,
    },
    analyst: null,
    answer_sdp: "test-answer",
    experimental: true,
  },
});
let controller: ReturnType<typeof createMessageSpeechController>;
let onError: ReturnType<typeof vi.fn>;
let getUserMedia: ReturnType<typeof vi.fn>;
const flush = () => vi.advanceTimersByTimeAsync(100);
const sent = (peer = peers[0]) => peer.channel.send.mock.calls.map(([data]) => JSON.parse(data));
const finish = (peer: FakePeer, id: string, transcript: string) =>
  peer.emit({ type: "turn.done", turn: { id, role: "assistant", transcript } });

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  peers.length = contexts.length = audios.length = sockets.length = 0;
  vi.stubGlobal("RTCPeerConnection", FakePeer);
  vi.stubGlobal("AudioContext", FakeContext);
  vi.stubGlobal("Audio", FakeAudio);
  vi.stubGlobal("MediaStream", FakeStream);
  getUserMedia = vi.fn();
  vi.stubGlobal("navigator", { ...navigator, mediaDevices: { getUserMedia } });
  vi.mocked(startCodexVoiceCall).mockResolvedValue(started());
  controller = createMessageSpeechController();
  onError = vi.fn();
});
afterEach(async () => {
  await controller.stop();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("复用 Codex persona 和 Cove，仅发送生成的静音音轨，不访问麦克风", async () => {
  controller.toggle("one", "这是一段中文朗读。", "zh-CN", onError);
  await flush();
  expect(startCodexVoiceCall).toHaveBeenCalledOnce();
  expect(startCodexVoiceCall).toHaveBeenCalledWith(
    expect.objectContaining({
      voice: "cove",
      offerSdp: "test-offer",
      applicationContext: expect.objectContaining({
        mode: "persona",
        instructions: expect.stringContaining("Mandarin Chinese"),
      }),
    }),
  );
  expect(getUserMedia).not.toHaveBeenCalled();
  expect(contexts[0].source.offset.value).toBe(0);
  expect(peers[0].addTrack).toHaveBeenCalledWith(
    contexts[0].destination.stream.tracks[0],
    contexts[0].destination.stream,
  );
  expect(controller.getSnapshot()?.phase).toBe("connecting");
  expect(sent()[0].content[0].text).toContain("<text_to_read>这是一段中文朗读。</text_to_read>");
  sockets[0].emit({ type: "provider_command", message: { type: "greeting" } });
  expect(peers[0].channel.send).toHaveBeenCalledOnce();
});

it("长消息按协议预算顺序朗读，重复结束事件不会重复发送，末尾播放后释放连接", async () => {
  const text = "需要完整朗读这一句，".repeat(22) + "结束。";
  controller.toggle("long", text, "zh-CN", onError);
  await flush();
  let index = 0;
  const chunks: string[] = [];
  while (controller.getActiveKey()) {
    const messages = sent();
    if (index >= messages.length) break;
    const message = messages[index];
    expect(new TextEncoder().encode(message.content[0].text).length).toBeLessThanOrEqual(500);
    const chunk = message.content[0].text.split("<text_to_read>")[1].split("</text_to_read>")[0];
    chunks.push(chunk);
    peers[0].emit({ type: "output_transcript.added", item: { text: chunk } });
    expect(controller.getSnapshot()?.phase).toBe("reading");
    finish(peers[0], `turn-${index}`, chunk);
    finish(peers[0], `turn-${index}`, chunk);
    index++;
  }
  expect(chunks.join("").replace(/\s/gu, "")).toBe(text);
  expect(stopCodexVoiceCall).not.toHaveBeenCalled();
  await vi.advanceTimersByTimeAsync(1600);
  expect(controller.getActiveKey()).toBeNull();
  expect(stopCodexVoiceCall).toHaveBeenCalledExactlyOnceWith("own-call");
  expect(contexts[0].close).toHaveBeenCalledOnce();
  expect(peers[0].close).toHaveBeenCalledOnce();
  expect(audios[0].srcObject).toBeNull();
});

it("在连接尚未返回时停止，迟到的成功响应只能释放自己的会话", async () => {
  let resolve!: (value: ReturnType<typeof started>) => void;
  vi.mocked(startCodexVoiceCall).mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  controller.toggle("one", "测试。", "zh-CN", onError);
  await flush();
  const stopping = controller.stop();
  expect(controller.getActiveKey()).toBeNull();
  expect(peers[0].close).toHaveBeenCalledOnce();
  resolve(started("late-own-call"));
  await stopping;
  expect(stopCodexVoiceCall).toHaveBeenCalledExactlyOnceWith("late-own-call");
  expect(sockets).toHaveLength(0);
  expect(onError).not.toHaveBeenCalled();
});

it("其他语音通话占用时提示占用，不关闭其他会话", async () => {
  vi.mocked(startCodexVoiceCall).mockResolvedValue({
    ok: false,
    error: { code: "codex_voice_busy", message: "busy" },
  });
  controller.toggle("one", "测试。", "zh-CN", onError);
  await flush();
  expect(onError).toHaveBeenCalledExactlyOnceWith("busy");
  expect(stopCodexVoiceCall).not.toHaveBeenCalled();
  expect(controller.getActiveKey()).toBeNull();
  expect(contexts[0].close).toHaveBeenCalledOnce();
});

it.each([
  ["codex_voice_realtime_auth_failed", "login"],
  ["read_only", "readOnly"],
  ["codex_voice_realtime_connection_failed", "failed"],
])("服务错误 %s 显示可理解的状态 %s", async (code, expected) => {
  vi.mocked(startCodexVoiceCall).mockResolvedValue({
    ok: false,
    error: { code, message: "failed" },
  });
  controller.toggle("one", "测试。", "zh-CN", onError);
  await flush();
  expect(onError).toHaveBeenCalledExactlyOnceWith(expected);
  expect(controller.getActiveKey()).toBeNull();
});

it("浏览器阻止音频播放时停止，不假装正在朗读", async () => {
  controller.toggle("one", "测试。", "zh-CN", onError);
  await Promise.resolve();
  await Promise.resolve();
  audios[0].play.mockRejectedValue(new DOMException("blocked", "NotAllowedError"));
  await flush();
  expect(onError).toHaveBeenCalledExactlyOnceWith("playbackBlocked");
  expect(controller.getActiveKey()).toBeNull();
  expect(stopCodexVoiceCall).toHaveBeenCalledWith("own-call");
});

it("只确认收到文本但没有语音输出时超时并释放连接", async () => {
  controller.toggle("one", "测试。", "zh-CN", onError);
  await flush();
  peers[0].emit({ type: "session.context.appended" });
  await vi.advanceTimersByTimeAsync(31000);
  expect(onError).toHaveBeenCalledExactlyOnceWith("failed");
  expect(controller.getActiveKey()).toBeNull();
  expect(stopCodexVoiceCall).toHaveBeenCalledWith("own-call");
});

it("连接断开或服务返回错误时恢复，不处理停止后的旧事件", async () => {
  controller.toggle("one", "测试。", "zh-CN", onError);
  await flush();
  peers[0].emit({ type: "error", error: { code: "provider_error" } });
  await flush();
  expect(onError).toHaveBeenCalledOnce();
  peers[0].emit({ type: "output_transcript.added", item: { text: "迟到的文字" } });
  finish(peers[0], "late", "迟到的文字");
  expect(controller.getActiveKey()).toBeNull();
  expect(onError).toHaveBeenCalledOnce();
});

it("高字节字符也不能超过单个上下文帧的 500 字节预算", async () => {
  controller.toggle("emoji", "😀".repeat(80), "zh-CN", onError);
  await flush();
  for (const message of sent())
    expect(new TextEncoder().encode(message.content[0].text).length).toBeLessThanOrEqual(500);
});
