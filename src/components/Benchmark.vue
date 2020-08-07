<template>
    <div class="benchmark">
        {{ sources }}
    </div>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
import { createDependencies } from "@/components/benchmark";

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
            // NOOP
        });

        return {
            sources,
        };
    },
});
</script>
