<script setup>
import SpeechRecognition from './components/SpeechRecognition.vue';
import {ref} from 'vue'
const text =ref('')
const isEnd = ref(false)
const starting = ref(false)
const onData = (data) => {
  text.value = data.transcript
}
const onEnd = () => {
  isEnd.value = true
  starting.value = false
}

const onStart = () => {
  starting.value = true
  isEnd.value = false
}
</script>

<template>
  <div>
    <h1>Speech Recognition</h1>
    <speech-recognition @data="onData" @recognition-end="onEnd" @recognition-start="onStart"></speech-recognition>
    <p>{{text}}</p>
    <p>starting: {{starting}} isEnd: {{isEnd}}</p>
    
  </div>
</template>
