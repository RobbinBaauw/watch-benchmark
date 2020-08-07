<template>
    <div class="benchmark">
        <button @click="mutate">Mutate value</button>

        <p v-if="previousDuration !== undefined">
            Previous duration: {{ previousDuration }} ms <br />
            Watcher called {{ watcherInvocations }} times <br />
            Duration / watcher: {{ previousDuration / watcherInvocations }} ms
        </p>

        <p>
            Amount of watch sources: {{ watchSources.length }}. <br />
            First source: {{ watchSources[0] }}
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent, watch, PropType, nextTick, ref } from "vue";
import { mutateSource, createDependencies, Benchmark, Source } from "@/components/dependencies";

export default defineComponent({
    name: "Benchmark",
    props: {
        benchmark: {
            type: Object as PropType<Benchmark>,
            required: true,
        },
    },
    setup(props) {
        let { watchSources, watchSource } = createDependencies(
            props.benchmark.sourceTypes,
            props.benchmark.sourceChange,
        );

        const watcherInvocations = ref(0);
        watch(watchSource, () => {
            watcherInvocations.value++;
        });

        const previousDuration = ref<number>();
        async function mutate() {
            watcherInvocations.value = 0;

            const start = performance.now();
            for (let i = 0; i < 10_000; i++) {
                mutateSource(watchSources.value[i % watchSources.value.length]);
                await nextTick();
            }
            const end = performance.now();

            previousDuration.value = end - start;
        }

        return {
            watchSources,
            previousDuration,
            watcherInvocations,
            mutate,
        };
    },
});
</script>
