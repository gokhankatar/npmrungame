<script lang="ts" setup>
import { buildSiteSchemaGraph } from "~/utils/siteSchema";

const schemaJson = JSON.stringify(buildSiteSchemaGraph());

useHead({
  script: [
    {
      key: "site-jsonld",
      type: "application/ld+json",
      innerHTML: schemaJson,
    },
  ],
});
</script>

<template>
  <!-- Yapılandırılmış veri — görünür içerik yok -->
</template>
