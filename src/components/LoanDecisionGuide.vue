<template>
  <section class="section">
    <h2>{{ copy.sections.loanDecisionGuide }}</h2>
    <div class="guide">
      <div class="guide-intro">
        <h3>{{ guide.title }}</h3>
        <blockquote>{{ guide.question }}</blockquote>
        <p>{{ guide.checksIntro }}</p>
        <p class="guide-emphasis">{{ guide.checksOutro }}</p>
      </div>

      <div v-for="section in guide.sections" :key="section.title" class="guide-card">
        <h3>{{ section.title }}</h3>
        <p v-if="section.subtitle" class="guide-subtitle">{{ section.subtitle }}</p>
        <p v-for="paragraph in section.paragraphs || []" :key="paragraph">{{ paragraph }}</p>
        <div v-if="section.code?.length" class="guide-code">
          <pre><code>{{ section.code.join('\n') }}</code></pre>
        </div>
        <ul v-if="section.bullets?.length" class="guide-list">
          <li v-for="item in section.bullets" :key="item">{{ item }}</li>
        </ul>
        <p v-if="section.note" class="guide-note">{{ section.note }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  copy: {
    type: Object,
    required: true
  }
});

const guide = computed(() => props.copy.loanDecisionGuide);
</script>
