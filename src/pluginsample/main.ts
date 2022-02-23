import { Packet } from 'modloader64_api/ModLoaderDefaultImpls';
import { Heap } from 'modloader64_api/heap';
import { ILoggerLevels, IModLoaderAPI, IPlugin } from 'modloader64_api/IModLoaderAPI';
import { NetworkHandler } from 'modloader64_api/NetworkHandler';
import { onTick, onViUpdate } from 'modloader64_api/PluginLifecycle';
import { bool_ref } from 'modloader64_api/Sylvain/ImGui';

// see usage below in onViUpdate
class SomeDetailedPacket extends Packet {
    counter: number = 0

    constructor(counter: number, lobby: string) {
        super("SomeDetailedPacket", "SomeChannel", lobby, true)
        this.counter = counter
    }
}

export class PluginSample implements IPlugin {
    ModLoader = {} as IModLoaderAPI
    name = "PluginSample"

    someCounterPointer = 0;

    sampleWindowOpen: bool_ref = [true]

    // run when this object is instanciated
    constructor() {
    }

    // before ModLoader is init
    preinit(): void {
        // print to the console
        this.ModLoader.logger.info("Hello, world!")
    }

    // called during ModLoader init
    init(): void {
        // you can also output warnings!
        this.ModLoader.logger.warn("Beware this message!")
    }

    // after ModLoader (and the emulator) is init
    postinit(): void {
        // you can interact with the emulator at this point
        let internal_name = this.ModLoader.rom.romReadBuffer(0x20, 0x18)

        this.ModLoader.logger.setLevel(ILoggerLevels.ALL)
        this.ModLoader.logger.debug(internal_name.toString('ascii')) // This only appears when the logger has the debug level!

        // don't have a heap? Make one!
        if (this.ModLoader.heap === undefined) {
            this.ModLoader.heap = new Heap(this.ModLoader.emulator, 0x81000000, (0x83DFFFFC - 0x81000000))
        }
    }

    // run every frame (the emulator is ready to be interacted with on frame 0)
    onTick(frame: number): void {
        if (this.someCounterPointer === 0) {
            this.someCounterPointer = this.ModLoader.heap!.malloc(4)
            this.ModLoader.logger.info(`someCounterPointer is allocated at ${this.someCounterPointer.toString(16)}`)
        }

        // node that the heap allocates in the emulated memory
        this.ModLoader.emulator.rdramWrite32(this.someCounterPointer, frame)

        if (frame == 60) {
            // we can also log errors (this does not stop the emulator)
            this.ModLoader.logger.error("OH NO! SIXY FRAMES HAVE PASSED!!!")
        }
    }

    // run every vertical interrupt
    @onViUpdate()
    onViUpdate() {
        // We can create windows using ImGui!
        this.ModLoader.ImGui.begin("SamplePlugin Window", this.sampleWindowOpen)
        {
            let counter = -1
            if (this.someCounterPointer !== 0) {
                counter = this.ModLoader.emulator.rdramRead32(this.someCounterPointer)
                this.ModLoader.ImGui.text(`frame: ${counter.toString()}`)
            }
            this.ModLoader.ImGui.separator()

            // send a basic packet
            if (this.ModLoader.ImGui.button("Send SomePacket")) {
                // packet id, packet channel, lobby, forward to other players (if false, the packet is handled by the server)
                let packet = new Packet("SomePacket", "SomeChannel", this.ModLoader.clientLobby, true)
                this.ModLoader.clientSide.sendPacket(packet)
            }

            // send a packet with data tacked on
            if (this.ModLoader.ImGui.button("Send SomeDetailedPacket")) {
                let packet = new SomeDetailedPacket(counter, this.ModLoader.clientLobby)
                this.ModLoader.clientSide.sendPacket(packet)
            }
        }
        this.ModLoader.ImGui.end()
    }

    // note that you do not receive packets sent by yourself, unless you are not forwarding the packet, and the server sends it back to you
    @NetworkHandler("SomePacket")
    onSomePacket(packet: Packet) {
        this.ModLoader.logger.info("We got some packet!")
    }

    @NetworkHandler("SomeDetailedPacket")
    onSomeDetailedPacket(packet: SomeDetailedPacket) {
        this.ModLoader.logger.info(`We got some detailed packet! The counter is ${packet.counter} !`)
    }

    // the user can make various events using the event bus, and there are various other events built into ModLoader. Some game cores have events as well
}

// export plugin (you can also use the default keyword on the class)
module.exports = PluginSample

