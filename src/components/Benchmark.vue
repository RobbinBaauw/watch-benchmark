<template>
    <div class="benchmark">
        <button @click="mutate">Mutate value</button>
        <p>Amount of sources: {{ sources.length }}</p>
        <p>First source: {{ sources[0] }}</p>
    </div>
</template>

<script lang="ts">
import { defineComponent, watch, PropType } from "vue";
import { mutateSource, createDependencies, Benchmark } from "@/components/dependencies";

export default defineComponent({
    name: "Benchmark",
    props: {
        benchmark: {
            type: Object as PropType<Benchmark>,
            required: true,
        },
    },
    setup(props) {
        let { sources, watchSource } = createDependencies(props.benchmark.sourceTypes, props.benchmark.sourceChange);

        watch(watchSource, () => {
            console.log("Watcher called!");
        });

        let clickCount = 0;

        return {
            sources,
            mutate: () => {
                mutateSource(sources[clickCount++]);
            },
        };
    },
});
</script>
