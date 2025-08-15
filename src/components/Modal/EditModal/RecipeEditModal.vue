<script setup lang="ts">

</script>

<template>
  <a-modal :visible="true">
    <a-form>
      <a-form-item label="AAA">
        <a-select placeholder="please select your zone">
          <a-select-option value="shanghai">Zone one</a-select-option>
          <a-select-option value="beijing">Zone two</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<style scoped>

</style>
