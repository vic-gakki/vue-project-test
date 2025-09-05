<template>
  <div class="speech-recongnition" v-if="speechRecognition || forceRender">
    <div class="voice-animation" v-show="showWave">
      <div class="voice-bar" v-for="(_, index) in 5" :key="index" :style="{ animationDelay: `${index * 0.1}s` }"></div>
    </div>
    <button type="button" @click="onClick($event)" @mousedown="onPressStart" @mouseup="onPressEnd" @mouseleave="onPressEnd"
      @touchstart="onPressStart" @touchend="onPressEnd" @touchcancel="onPressEnd" class="record-btn">
      <svg v-if="isStart" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Iconoir by Luca Burgio - https://github.com/iconoir-icons/iconoir/blob/main/LICENSE --><g fill="none" stroke="#ff0000" stroke-width="1.5"><rect width="6" height="12" x="9" y="2" rx="3"/><path stroke-linecap="round" stroke-linejoin="round" d="M5 10v1a7 7 0 0 0 7 7v0a7 7 0 0 0 7-7v-1m-7 8v4m0 0H9m3 0h3"/></g></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Iconoir by Luca Burgio - https://github.com/iconoir-icons/iconoir/blob/main/LICENSE --><g fill="none" stroke="currentColor" stroke-width="1.5"><rect width="6" height="12" x="9" y="2" rx="3"/><path stroke-linecap="round" stroke-linejoin="round" d="M5 10v1a7 7 0 0 0 7 7v0a7 7 0 0 0 7-7v-1m-7 8v4m0 0H9m3 0h3"/></g></svg>
    </button>
  </div>
</template>
<script setup>

const defaultInitOptions = {
  interimResults: false, // 开启临时结果
  maxAlternatives: 1, // 最大候选项数
  continuous: false, // 启用连续识别模式
  lang: 'en-IE'
}
import { ref, onMounted, computed } from 'vue';
defineOptions({
  name: 'SpeechRecognition'
})
const props = defineProps({
  // 是否强制渲染组件
  forceRender: {
    type: Boolean,
    default: false
  },
  initOptions: {
    type: Object,
  },
  trigger: {
    type: String,
    validate: (val) => {
      return ['click', 'press'].includes(val);  
    },
    default: 'click'
  }
})
const emits = defineEmits(["data", "not-supported", "recognition-start", "recognition-end", "no-match"]);
const isStart = ref(false);
const speechRecognition = ref(null)
const showWave = ref(false)
const clickTrigger = computed(() => props.trigger === 'click')
onMounted(() => {
  // 检查浏览器是否支持 SpeechRecognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    emits("not-supported");
  } else {
    const recognition = new SpeechRecognition();
    Object.assign(recognition, defaultInitOptions, props.initOptions);
    // 识别开始时的事件
    recognition.onstart = () => {
      showWave.value = true;
      emits('recognition-start');
    };

    recognition.onnomatch = () => {
      emits('no-match')
    };

    // 获取识别结果
    recognition.onresult = (event) => {
      const res = event.results[0]
      const isFinal = res.isFinal
      const transcript = res[0].transcript
      if (transcript) {
        emits('data', {
          isFinal: res.isFinal,
          transcript: res[0].transcript
        })
      } else if (isFinal) {
        emits('no-match')
      }
    };

    // 识别结束时的事件
    recognition.onend = () => {
      isStart.value = false;
      showWave.value = false;
      emits('recognition-end')
    };

    // 识别错误时的事件
    recognition.onerror = (event) => {
      console.error("Error occurred in recognition: ", event.error);
      isStart.value = false;
      showWave.value = false
      emits('error', event.error);
    };

    recognition.onsoundstart = () => {
      // showWave.value = true

    };
    recognition.onsoundend = () => {
      // showWave.value = false
    };
    speechRecognition.value = recognition;
  }
})

const onClick = (e) => {
  if (!clickTrigger.value) return
  send2Adobe(e);
  if (isStart.value) {
    onStop()
  } else {
    onStart()
  }
}

const send2Adobe = (e)=>{
  let pageName = globalThis.flash_fe_core_tool?.$util.$coreMethods.getMetaContent("taxonomytype");
    let componentName = e?.target?.closest("div[componentname]")?.getAttribute('componentname') || '';
    let _lmd = {
      custom:`${pageName} : ${componentName} | Voice Search Icon Clicked`,

    }
    globalThis.window.lmd = Object.assign({},globalThis.flash_fe_core_tool?.$adobe._lmd,_lmd);
    globalThis.flash_fe_core_tool?.$adobe.doit("CustomInteraction");
}

let timer = null
const onPressStart = () => {
  if (clickTrigger.value) return
  timer = setTimeout(() => {
    onStart()
    timer = null
  }, 200)
}

const onPressEnd = () => {
  if (clickTrigger.value) return
  if(timer){
    clearTimeout(timer)
    timer = null
  }else {
    onStop()
  }
}

const onStop = () => {
  speechRecognition.value?.stop();
  isStart.value = false;
}

const onStart = () => {
  speechRecognition.value?.start();
  isStart.value = true;
}

defineExpose({
  onStop,
  onStart
});
</script>
<style>
.speech-recognition {
  display: inline-flex;
  align-items: center;
  position: relative;
  padding-left: 52px;
  .voice-animation {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 32px;
    gap: 4px;
    padding: 0 8px;
    left: 0;
  }
  
  .voice-bar {
    width: 4px;
    background-color: #000;
    border-radius: 8px;
    animation: voiceWave .5s infinite ease-in-out;
  }
  
  .record-btn {
    cursor: pointer;
  
    .iconfont-microphone,
    .iconfont-microphone-filled {
      font-size: 20px;
    }
  }
}


@keyframes voiceWave {
  0% {
    height: 8px;
  }
  50% {
    height: 20px;
  }
  100% {
    height: 8px;
  }
}</style>