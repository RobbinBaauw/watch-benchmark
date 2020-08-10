<template>
    <div id="app">
        <label
            >Import:
            <input v-model="currentVueImport" />
        </label>

        <br /><br />

        Imported Vue instances:
        <ul v-if="vueImports.size > 0">
            <li v-for="link in vueImports" :key="link">{{ link }}</li>
        </ul>
        <p v-else>Nothing imported yet!</p>

        <br />

        <button @click="loadScript">Import Vue</button>

        <hr />

        <label
            >Do sources change?
            <select v-model="sourceChange">
                <option value="no">No change</option>
                <option value="little">Little change. 5% of the sources will be changed</option>
                <option value="lots">Lots of change. 50% of the sources will be changed</option>
            </select>
        </label>

        <br /><br />

        <label>
            Sources to use:
            <select v-model="sourceTypes.type" name="sourceType">
                <option value="mixed">Mixed</option>
                <option value="ref">Only refs</option>
                <option value="object">Only objects</option>
                <option value="array">Only arrays</option>
            </select>
        </label>

        <br /><br />

        <div v-if="sourceTypes.type === 'mixed'">
            <label
                >Amount of refs:
                <input v-model="sourceTypes.refs" type="number" />
            </label>
            <br />
            <label
                >Amount of objects:
                <input v-model="sourceTypes.objects" type="number" />
            </label>
            <br />
            <label
                >Amount of arrays:
                <input v-model="sourceTypes.arrays" type="number" />
            </label>
            <br />
        </div>
        <div v-else>
            <label
                >Amount of sources:
                <input v-model="sourceTypes.amount" type="number" />
            </label>
            <br />
        </div>

        <br /><br />

        <label
            >Vue global name:
            <input v-model="vueGlobalName" />
        </label>

        <br /><br />

        <button @click="addBenchmark">Add benchmark</button>

        <hr />

        <Benchmark v-for="(benchmark, i) in benchmarks" :key="i" :benchmark="benchmark" />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import Benchmark from "./components/Benchmark.vue";
import { SourceChange, SourceTypes, BenchmarkOptions as BenchmarkType } from "./components/dependencies";

export default defineComponent({
    name: "App",
    components: {
        Benchmark,
    },
    setup() {
        const sourceChange = ref<SourceChange>("no");
        const sourceTypes = reactive<SourceTypes>({
            type: "mixed",
            refs: 200,
            objects: 200,
            arrays: 200,
        });
        const vueGlobalName = ref("Vue");

        const benchmarks = ref<BenchmarkType[]>([]);

        const vueImports = ref<Set<string>>(new Set());
        const currentVueImport = ref("https://unpkg.com/vue@3.0.0-rc.5/dist/vue.global.prod.js");

        return {
            sourceChange,
            sourceTypes,
            vueGlobalName,

            benchmarks,

            vueImports,
            currentVueImport,

            loadScript() {
                if (!vueImports.value.has(currentVueImport.value)) {
                    const script = document.createElement("script");
                    script.type = "application/javascript";
                    script.src = currentVueImport.value;
                    document.body.appendChild(script);

                    vueImports.value.add(currentVueImport.value);
                }
            },

            addBenchmark() {
                let multiplier = 1;
                if (sourceChange.value === "little") {
                    // As 95% of the sources will remain
                    multiplier = 1 / 0.95;
                } else if (sourceChange.value === "lots") {
                    // As 50% of the sources will remain
                    multiplier = 1 / 0.5;
                }

                // To change the sources used in effects, a subset of the precreated sources is taken
                // To be sure that the same amount of sources are used as the user asked for, make more sources than will eventually be used in the effect
                let compensatedSourceTypes: SourceTypes;
                if (sourceTypes.type === "mixed") {
                    compensatedSourceTypes = {
                        type: "mixed",
                        refs: sourceTypes.refs * multiplier,
                        arrays: sourceTypes.arrays * multiplier,
                        objects: sourceTypes.objects * multiplier,
                    };
                } else {
                    compensatedSourceTypes = {
                        type: sourceTypes.type,
                        amount: sourceTypes.amount * multiplier,
                    };
                }

                benchmarks.value.push({
                    sourceTypes: compensatedSourceTypes,
                    sourceChange: sourceChange.value,
                    vueGlobalName: vueGlobalName.value,
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
