# Benchmark

Run the string-library benchmark from [Performance](/guide/performance) in your own browser.
Each library returns an HTML string with every match wrapped in a `span`. Before timing, the
benchmark checks that every library highlights exactly the same text as lucid-search, and leaves
out any library that doesn't.

Each library runs for about one second per scenario, so a run takes about 20 seconds. Results
vary with the browser and the machine: compare the bars, not the numbers.

<Benchmark />
