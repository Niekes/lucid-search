# Playground

Type a query and pick a function and its options. The cards sum up what the function
returns, and the haystack below highlights the matches. Click **Edit text** to search your
own haystack.

`typos` is a maximum: a term gets at most one typo per 4 letters, so `mllr` (4 letters) gets 1
even with `typos` at 2, and does not find Müller, which is 2 typos away.

<Playground />

## Search a list

A search box over 10,000 made-up companies. Every company's name and URL go through
`findRanges`, and `score` ranks the results, with a match in the name counting five times as
much as one in the URL. The top ten are shown, highlighted with `toSegments`. With `typos` at 1, `mulelr`
still finds Müller; set it to 0 for exact matches only.

<CompanySearch />
