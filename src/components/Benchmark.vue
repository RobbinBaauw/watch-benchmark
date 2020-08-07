<template>
    <div class="benchmark">
        <button @click="alter">Alter value</button>
        {{ sources }}
    </div>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
import { alterSource, createDependencies } from "@/components/dependencies";

export default defineComponent({
    name: "Benchmark",
    setup() {
        let { sources, watchSource } = createDependencies(
            {
                type: "mixed",
                arrays: 10,
                objects: 90,
                refs: 400,
            },
            {
                type: "no",
            },
        );

        watch(watchSource, () => {
            console.log("Watcher called!");
        });

        let clickCount = 0;

        return {
            sources,
            alter: () => {
                clickCount++;
                alterSource(sources[clickCount]);
            },
        };
    },
});
</script>
