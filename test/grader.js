
<!-- saved from url=(0060)https://spark-public.s3.amazonaws.com/startup/code/grader.js -->
<html><head><meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1"></head><body><code class="prettyprint"><span class="com">#!/usr/bin/env node</span><br><br><span class="com">/*</span><br><span class="com">Automatically grade files for the presence of specified HTML tags/attributes.</span><br><span class="com">Uses commander.js and cheerio. Teaches command line application development</span><br><span class="com">and basic DOM parsing.</span><br><br><span class="com">References:</span><br><br><span class="com"> + cheerio</span><br><span class="com"> - https://github.com/MatthewMueller/cheerio</span><br><span class="com"> - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/</span><br><span class="com"> - http://maxogden.com/scraping-with-node.html</span><br><br><span class="com"> + commander.js</span><br><span class="com"> - https://github.com/visionmedia/commander.js</span><br><span class="com"> - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy</span><br><br><span class="com"> + JSON</span><br><span class="com"> - http://en.wikipedia.org/wiki/JSON</span><br><span class="com"> - https://developer.mozilla.org/en-US/docs/JSON</span><br><span class="com"> - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2</span><br><span class="com">*/</span><br><br><span class="kwd">var</span><span class="pln"> fs </span><span class="pun">=</span><span class="pln"> </span><span class="kwd">require</span><span class="pun">(</span><span class="str">'fs'</span><span class="pun">);</span><br><span class="kwd">var</span><span class="pln"> program </span><span class="pun">=</span><span class="pln"> </span><span class="kwd">require</span><span class="pun">(</span><span class="str">'commander'</span><span class="pun">);</span><br><span class="kwd">var</span><span class="pln"> cheerio </span><span class="pun">=</span><span class="pln"> </span><span class="kwd">require</span><span class="pun">(</span><span class="str">'cheerio'</span><span class="pun">);</span><br><span class="kwd">var</span><span class="pln"> HTMLFILE_DEFAULT </span><span class="pun">=</span><span class="pln"> </span><span class="str">"index.html"</span><span class="pun">;</span><br><span class="kwd">var</span><span class="pln"> CHECKSFILE_DEFAULT </span><span class="pun">=</span><span class="pln"> </span><span class="str">"checks.json"</span><span class="pun">;</span><br><br><span class="kwd">var</span><span class="pln"> assertFileExists </span><span class="pun">=</span><span class="pln"> </span><span class="kwd">function</span><span class="pun">(</span><span class="pln">infile</span><span class="pun">)</span><span class="pln"> </span><span class="pun">{</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="kwd">var</span><span class="pln"> instr </span><span class="pun">=</span><span class="pln"> infile</span><span class="pun">.</span><span class="pln">toString</span><span class="pun">();</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="kwd">if</span><span class="pln"> </span><span class="pun">(!</span><span class="pln">fs</span><span class="pun">.</span><span class="pln">existsSync</span><span class="pun">(</span><span class="pln">instr</span><span class="pun">))</span><span class="pln"> </span><span class="pun">{</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;console</span><span class="pun">.</span><span class="pln">log</span><span class="pun">(</span><span class="str">"%s does not exist. Exiting."</span><span class="pun">,</span><span class="pln"> instr</span><span class="pun">);</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;process</span><span class="pun">.</span><span class="kwd">exit</span><span class="pun">(</span><span class="lit">1</span><span class="pun">);</span><span class="pln"> </span><span class="com">// http://nodejs.org/api/process.html#process_process_exit_code</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="pun">}</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="kwd">return</span><span class="pln"> instr</span><span class="pun">;</span><br><span class="pun">};</span><br><br><span class="kwd">var</span><span class="pln"> cheerioHtmlFile </span><span class="pun">=</span><span class="pln"> </span><span class="kwd">function</span><span class="pun">(</span><span class="pln">htmlfile</span><span class="pun">)</span><span class="pln"> </span><span class="pun">{</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="kwd">return</span><span class="pln"> cheerio</span><span class="pun">.</span><span class="pln">load</span><span class="pun">(</span><span class="pln">fs</span><span class="pun">.</span><span class="pln">readFileSync</span><span class="pun">(</span><span class="pln">htmlfile</span><span class="pun">));</span><br><span class="pun">};</span><br><br><span class="kwd">var</span><span class="pln"> loadChecks </span><span class="pun">=</span><span class="pln"> </span><span class="kwd">function</span><span class="pun">(</span><span class="pln">checksfile</span><span class="pun">)</span><span class="pln"> </span><span class="pun">{</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="kwd">return</span><span class="pln"> JSON</span><span class="pun">.</span><span class="pln">parse</span><span class="pun">(</span><span class="pln">fs</span><span class="pun">.</span><span class="pln">readFileSync</span><span class="pun">(</span><span class="pln">checksfile</span><span class="pun">));</span><br><span class="pun">};</span><br><br><span class="kwd">var</span><span class="pln"> checkHtmlFile </span><span class="pun">=</span><span class="pln"> </span><span class="kwd">function</span><span class="pun">(</span><span class="pln">htmlfile</span><span class="pun">,</span><span class="pln"> checksfile</span><span class="pun">)</span><span class="pln"> </span><span class="pun">{</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;$ </span><span class="pun">=</span><span class="pln"> cheerioHtmlFile</span><span class="pun">(</span><span class="pln">htmlfile</span><span class="pun">);</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="kwd">var</span><span class="pln"> checks </span><span class="pun">=</span><span class="pln"> loadChecks</span><span class="pun">(</span><span class="pln">checksfile</span><span class="pun">)</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="pun">.</span><span class="pln">sort</span><span class="pun">();</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="kwd">var</span><span class="pln"> </span><span class="kwd">out</span><span class="pln"> </span><span class="pun">=</span><span class="pln"> </span><span class="pun">{};</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="kwd">for</span><span class="pln"> </span><span class="pun">(</span><span class="kwd">var</span><span class="pln"> ii </span><span class="kwd">in</span><span class="pln"> checks</span><span class="pun">)</span><span class="pln"> </span><span class="pun">{</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="kwd">var</span><span class="pln"> present </span><span class="pun">=</span><span class="pln"> $</span><span class="pun">(</span><span class="pln">checks</span><span class="pun">[</span><span class="pln">ii</span><span class="pun">])</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="pun">.</span><span class="pln">length </span><span class="pun">&gt;</span><span class="pln"> </span><span class="lit">0</span><span class="pun">;</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="kwd">out</span><span class="pun">[</span><span class="pln">checks</span><span class="pun">[</span><span class="pln">ii</span><span class="pun">]]</span><span class="pln"> </span><span class="pun">=</span><span class="pln"> present</span><span class="pun">;</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="pun">}</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="kwd">return</span><span class="pln"> </span><span class="kwd">out</span><span class="pun">;</span><br><span class="pun">};</span><br><br><span class="kwd">var</span><span class="pln"> clone </span><span class="pun">=</span><span class="pln"> </span><span class="kwd">function</span><span class="pun">(</span><span class="pln">fn</span><span class="pun">)</span><span class="pln"> </span><span class="pun">{</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="com">// Workaround for commander.js issue.</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="com">// http://stackoverflow.com/a/6772648</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="kwd">return</span><span class="pln"> fn</span><span class="pun">.</span><span class="pln">bind</span><span class="pun">({});</span><br><span class="pun">};</span><br><br><span class="kwd">if</span><span class="pln"> </span><span class="pun">(</span><span class="kwd">require</span><span class="pun">.</span><span class="pln">main </span><span class="pun">==</span><span class="pln"> </span><span class="kwd">module</span><span class="pun">)</span><span class="pln"> </span><span class="pun">{</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;program</span><span class="pun">.</span><span class="pln">option</span><span class="pun">(</span><span class="str">'-f, --file &lt;html_file&gt;'</span><span class="pun">,</span><span class="pln"> </span><span class="str">'Path to index.html'</span><span class="pun">,</span><span class="pln"> clone</span><span class="pun">(</span><span class="pln">assertFileExists</span><span class="pun">),</span><span class="pln"> HTMLFILE_DEFAULT</span><span class="pun">)</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="pun">.</span><span class="pln">option</span><span class="pun">(</span><span class="str">'-c, --checks &lt;check_file&gt;'</span><span class="pun">,</span><span class="pln"> </span><span class="str">'Path to checks.json'</span><span class="pun">,</span><span class="pln"> clone</span><span class="pun">(</span><span class="pln">assertFileExists</span><span class="pun">),</span><span class="pln"> CHECKSFILE_DEFAULT</span><span class="pun">)</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="pun">.</span><span class="pln">parse</span><span class="pun">(</span><span class="pln">process</span><span class="pun">.</span><span class="pln">argv</span><span class="pun">);</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="kwd">var</span><span class="pln"> checkJson </span><span class="pun">=</span><span class="pln"> checkHtmlFile</span><span class="pun">(</span><span class="pln">program</span><span class="pun">.</span><span class="pln">file</span><span class="pun">,</span><span class="pln"> program</span><span class="pun">.</span><span class="pln">checks</span><span class="pun">);</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="kwd">var</span><span class="pln"> outJson </span><span class="pun">=</span><span class="pln"> JSON</span><span class="pun">.</span><span class="pln">stringify</span><span class="pun">(</span><span class="pln">checkJson</span><span class="pun">,</span><span class="pln"> </span><span class="kwd">null</span><span class="pun">,</span><span class="pln"> </span><span class="lit">4</span><span class="pun">);</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;console</span><span class="pun">.</span><span class="pln">log</span><span class="pun">(</span><span class="pln">outJson</span><span class="pun">);</span><br><span class="pun">}</span><span class="pln"> </span><span class="kwd">else</span><span class="pln"> </span><span class="pun">{</span><br><span class="pln">&nbsp;&nbsp;&nbsp;&nbsp;exports</span><span class="pun">.</span><span class="pln">checkHtmlFile </span><span class="pun">=</span><span class="pln"> checkHtmlFile</span><span class="pun">;</span><br><span class="pun">}</span></code></body></html>