<template>
    <div class="benchmark">
        <button @click="mutate">Mutate value</button>

        <p v-if="previousTime !== undefined">
            Previous time: {{ previousTime }} ms <br />
            Watcher called {{ watcherInvocations }} times
        </p>

        <p>
            Amount of sources: {{ sources.length }}. <br />
            First source: {{ sources[0] }}
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent, watch, PropType, nextTick, ref } from "vue";
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

        const watcherInvocations = ref(0);
        watch(watchSource, () => {
            watcherInvocations.value++;
        });

        const previousTime = ref<number>();

        return {
            sources,
            previousTime,
            watcherInvocations,
            mutate: async () => {
                const start = performance.now();
                for (let i = 0; i < 10_000; i++) {
                    mutateSource(sources[i % sources.length]);
                    await nextTick();
                }
                const end = performance.now();

                previousTime.value = end - start;
            },
        };
    },
});
</script>
