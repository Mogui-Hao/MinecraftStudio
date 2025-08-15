<script setup lang="ts">
import { message } from 'ant-design-vue';
import type { MenuProps } from 'ant-design-vue';

// 定义事件
const emit = defineEmits<{
  (e: "create", path: string[]): void;
}>();

// 创建项目的处理函数
const create = (path: string[]) => {
  emit("create", path); // 触发事件
};

const handleMenuClick: MenuProps['onClick'] = e => {
  console.log('click', e);
  message.info(`你点击了菜单项 ${e.key}`);
  if (e.keyPath && e.keyPath[0] == "create") {
    // message.success(e.keyPath.slice(1).join('/'));
    create(e.keyPath.slice(1) as string[]);
  }
};

</script>

<template>
  <a-menu @click="handleMenuClick">
    <a-sub-menu key="create" title="创建">
      <a-menu-item key="recipe">配方</a-menu-item>
      <a-menu-item key="advancements" disabled>进度</a-menu-item>
      <a-menu-item key="loot_tables" disabled>战利品表</a-menu-item>
      <a-menu-item key="mcfunction" disabled>函数</a-menu-item>
      <a-menu-item key="predicates" disabled>条件判断</a-menu-item>
      <a-menu-item key="structures" disabled>结构模板</a-menu-item>
      <a-menu-item key="dimension" disabled>维度配置 (实验性)</a-menu-item>
      <a-menu-item key="dimension_type" disabled>维度类型 (实验性)</a-menu-item>
      <a-menu-item key="chat_type" disabled>聊天类型 (实验性)</a-menu-item>
      <a-menu-item key="damage_type" disabled>伤害类型 (实验性)</a-menu-item>
      <a-menu-item key="enchantment" disabled>附魔类型</a-menu-item>
      <a-menu-item key="instrument" disabled>山羊角乐器</a-menu-item>
      <a-menu-item key="jukebox_song" disabled>唱片机曲目</a-menu-item>
      <a-menu-item key="painting_variant" disabled>画变种</a-menu-item>
      <a-menu-item key="trim_material" disabled>盔甲纹饰</a-menu-item>
      <a-menu-item key="wolf_sound_variant" disabled>狼音效变种</a-menu-item>
      <a-menu-item key="test_environment" disabled>测试环境 (实验性)</a-menu-item>
      <a-sub-menu key="tags" title="标签" disabled>
        <a-menu-item key="blocks" disabled>方块</a-menu-item>
        <a-menu-item key="entity_types" disabled>实体标签</a-menu-item>
        <a-menu-item key="fluids" disabled>液体标签</a-menu-item>
        <a-menu-item key="functions" disabled>函数标签</a-menu-item>
        <a-menu-item key="items" disabled>物品标签</a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="worldgen" title="世界生成" disabled>
        <a-menu-item key="biome" disabled>生物群系</a-menu-item>
        <a-menu-item key="configured_carver" disabled>地形雕刻器</a-menu-item>
        <a-menu-item key="configured_feature" disabled>地物生成</a-menu-item>
        <a-menu-item key="configured_surface_builder" disabled>地表生成器</a-menu-item>
        <a-menu-item key="noise_settings" disabled>噪声生成器</a-menu-item>
        <a-menu-item key="processor_list" disabled>结构处理器</a-menu-item>
        <a-menu-item key="template_pool" disabled>结构模板池</a-menu-item>
      </a-sub-menu>
    </a-sub-menu>
    <a-menu-item key="reload">刷新</a-menu-item>
  </a-menu>
</template>

<style scoped>

</style>
