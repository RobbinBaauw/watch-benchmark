<template>
    <div id="app">
        Do sources change?
        <select v-model="sourceChange">
            <option value="no">No change</option>
            <option value="little">Little change</option>
            <option value="lots">Lots of change</option>
        </select>

        <br /><br />

        Sources to use:
        <select v-model="sourceTypes.type">
            <option value="mixed">Mixed</option>
            <option value="ref">Only refs</option>
            <option value="object">Only objects</option>
            <option value="array">Only arrays</option>
        </select>

        <br /><br />

        <div v-if="sourceTypes.type === 'mixed'">
            Amount of refs: <input v-model="sourceTypes.refs" type="number" /> <br />
            Amount of objects: <input v-model="sourceTypes.objects" type="number" /> <br />
            Amount of arrays: <input v-model="sourceTypes.arrays" type="number" /> <br />
        </div>

        <br /><br />

        <button @click="addBenchmark">Add benchmark</button>

        <hr />

        <Benchmark v-for="(benchmark, i) in benchmarks" :key="i" :benchmark="benchmark" />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import Benchmark from "./components/Benchmark.vue";
import { SourceChange, SourceTypes, Benchmark as BenchmarkType } from "./components/dependencies";

export default defineComponent({
    name: "App",
    components: {
        Benchmark,
    },
    setup() {
        const sourceChange = ref<SourceChange>("no");
        const sourceTypes = reactive<SourceTypes>({
            type: "mixed",
            refs: 400,
            objects: 100,
            arrays: 100,
        });

        const benchmarks = ref<BenchmarkType[]>([]);

        return {
            sourceChange,
            sourceTypes,
            benchmarks,

            addBenchmark() {
                benchmarks.value.push({
                    sourceTypes,
                    sourceChange: sourceChange.value,
                });
            },
        };
    },
});
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
