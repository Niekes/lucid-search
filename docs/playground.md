# Playground

Type a query and pick a function and its options. The cards sum up what the function
returns, and the haystack below highlights the matches. Click **Edit text** to search your
own haystack.

<Playground />

## Search a list

A search box over 10,000 made-up companies. Every company's name and URL go through
`findRanges`, and `score` ranks the results, with a match in the name counting five times as
much as one in the URL. The top ten are shown, highlighted with `toSegments`.

<CompanySearch />
