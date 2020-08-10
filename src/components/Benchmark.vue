<template>
    <div class="benchmark">
        <button @click="run">Run benchmark</button>

        <p v-if="benchmarkValue !== undefined">
            {{ benchmarkValue }} <br />
            Watcher called {{ watcherInvocations }} times <br />
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";
import { BenchmarkOptions, DependencyCreator, VueType } from "@/components/dependencies";
import { amountOfMutations } from "@/components/consts";
import { Event, Suite } from "benchmark";

declare const Benchmark: any;

export default defineComponent({
    name: "Benchmark",
    props: {
        benchmark: {
            type: Object as PropType<BenchmarkOptions>,
            required: true,
        },
    },
    setup(props) {
        const vueInstance = (window as any)[props.benchmark.vueGlobalName] as VueType;
        if (!vueInstance) throw new Error(`${props.benchmark.vueGlobalName} was not imported!`);

        const dependencyCreator = new DependencyCreator(vueInstance);
        let { watchSources, watchSource } = dependencyCreator.createDependencies(
            props.benchmark.sourceTypes,
            props.benchmark.sourceChange,
        );

        const watcherInvocations = ref(0);
        vueInstance.watch(watchSource, () => {
            watcherInvocations.value++;
        });

        const benchmarkValue = ref<string>();
        async function run() {
            benchmarkValue.value = "Running...";
            watcherInvocations.value = 0;

            const suite = new Benchmark.Suite() as Suite;
            suite
                .add(
                    "Trigger watcher",
                    async () => {
                        for (let i = 0; i < amountOfMutations; i++) {
                            dependencyCreator.mutateSource(watchSources.value[i % watchSources.value.length]);
                            await vueInstance.nextTick();
                        }
                    },
                    {
                        onComplete: ({ target }: Event) => {
                            benchmarkValue.value = `${Math.round(target.hz!)} ops/s ± ${target.stats!.rme.toFixed(2)}`;
                        },
                    },
                )
                .run({ async: true });
        }

        return {
            watchSources,
            benchmarkValue,
            watcherInvocations,
            run,
        };
    },
});
</script>
