<script lang="ts">
    import State from "$lib/State";
    import Play from "../components/Play.svelte";
    import Pause from "../components/Pause.svelte";
    import Stop from "../components/Stop.svelte";
    import TimerType from "../lib/TimerType";
    import {onMount} from "svelte";

    // config
    let workTimeInMinutes = 25;
    let breakTimeInMinutes = 5;
    let longBreak = false;

    // audio
    let endWorkTimeSound;
    let endBreakTimeSound;

    // internal state
    let message: string = '';
    let remainingTimeInSeconds: number = minutesToSeconds(workTimeInMinutes);
    let elapsedWorkTimes: number = 0;
    let elapsedBreakTimes: number = 0;
    let currentState: State = State.STOPPED;
    let currentTimerType: TimerType = TimerType.WORK;
    let intervalId: NodeJS.Timer|null = null;

    onMount(() => {
        endWorkTimeSound = new Audio();
        endWorkTimeSound.src = './Cs4.flac';
        endWorkTimeSound.preload = 'auto';
        endWorkTimeSound.volume = 1;

        endBreakTimeSound = new Audio();
        endBreakTimeSound.src = './E4.flac';
        endBreakTimeSound.preload = 'auto';
        endBreakTimeSound.volume = 1;
    });

    function play() {
        currentState = State.PLAYING;

        if (intervalId) {
            clearInterval(intervalId);
        }

        updateHeadMessage();

        // Call "spendTime" every second
        intervalId = setInterval(spendTime, 1000);
    }

    function pause() {
        if (intervalId) {
            clearInterval(intervalId);
        }
        currentState = State.PAUSED;
    }

    function stop() {
        if (intervalId) {
            clearInterval(intervalId);
        }
        currentState = State.STOPPED;
        remainingTimeInSeconds = minutesToSeconds(workTimeInMinutes);

        elapsedWorkTimes = 0;
        elapsedBreakTimes = 0;
    }

    function stateAsString(state: State): string {
        switch (state) {
            case State.PLAYING:
                return 'Playing';
            case State.PAUSED:
                return 'Paused';
            case State.STOPPED:
                return 'Stopped';
        }
    }

    function timeToString(timeInSeconds: number): string {
        let minutes = Math.floor(timeInSeconds / 60).toString(10).padStart(2, '0');
        let seconds = (timeInSeconds % 60).toString(10).padStart(2, '0');

        return `${minutes}:${seconds}`;
    }

    function minutesToSeconds(minutes: number): number {
        return minutes * 60;
    }

    function spendTime() {
        remainingTimeInSeconds--;

        if (remainingTimeInSeconds === 0) {
            switch (currentTimerType) {
                case TimerType.WORK:
                    remainingTimeInSeconds = minutesToSeconds(breakTimeInMinutes);
                    currentTimerType = TimerType.BREAK;
                    let endWorkTimeSoundNode = endWorkTimeSound.cloneNode();
                    endWorkTimeSoundNode.play();
                    elapsedWorkTimes++;
                    break;
                case TimerType.BREAK:
                    currentTimerType = TimerType.WORK;
                    let endBreakTimeSoundNode = endBreakTimeSound.cloneNode();
                    endBreakTimeSoundNode.play();
                    elapsedBreakTimes++;
                    if (longBreak && elapsedBreakTimes % 4 === 0) {
                        remainingTimeInSeconds = minutesToSeconds(10);
                    } else {
                        remainingTimeInSeconds = minutesToSeconds(workTimeInMinutes);
                    }
                    break;
            }
            updateHeadMessage();
        }
    }

    function updateHeadMessage() {
        switch (currentTimerType) {
            case TimerType.WORK:
                message = 'Work time!';
                break;
            case TimerType.BREAK:
                message = 'Break time!';
                break;
        }
    }

    function updateBaseRemainingTime() {
        switch (currentTimerType) {
            case TimerType.WORK:
                remainingTimeInSeconds = minutesToSeconds(workTimeInMinutes);
                break;
            case TimerType.BREAK:
                remainingTimeInSeconds = minutesToSeconds(breakTimeInMinutes);
                break;
        }
    }
</script>

<h1>Pomodoro timer</h1>

<div id="timer">
    <div id="message">
        {message}
    </div>
    <div id="remaining">
        Remaining time:
        <span id="value">
            {timeToString(remainingTimeInSeconds)} ({stateAsString(currentState)})
        </span>
    </div>
    <div id="actions">
        {#if currentState === State.STOPPED}
            <Play on:click={play} />
        {:else if currentState === State.PLAYING}
            <Pause on:click={pause} />
        {:else if currentState === State.PAUSED}
            <Play on:click={play} />
            <Stop on:click={stop} />
        {:else}
            Er... bug?
        {/if}
    </div>
    <div id="config">
        <div>
            <label for="longBreak">Set up a long break <small>(10 minutes break every 4th break session)</small></label>
            <input
                type="checkbox"
                id="longBreak"
                bind:checked={longBreak}
                disabled={currentState !== State.STOPPED}
            >
        </div>
        <div>
            <label for="workTimeInMinutes">Work time <small>(in minutes)</small></label>
            <input
                type="number"
                id="workTimeInMinutes"
                bind:value={workTimeInMinutes}
                on:change={updateBaseRemainingTime}
                min="5"
                max="60"
                disabled={currentState !== State.STOPPED}
            >
        </div>
        <div>
            <label for="breakTimeInMinutes">Break time <small>(in minutes)</small></label>
            <input
                type="number"
                id="breakTimeInMinutes"
                min="1"
                max="5"
                bind:value={breakTimeInMinutes}
                disabled={currentState !== State.STOPPED}
            >
        </div>
    </div>
</div>
