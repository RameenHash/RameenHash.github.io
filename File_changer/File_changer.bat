cd C:\Users\eli_000\Desktop\




call :treeProcess
goto :eof

:treeProcess

 ren *.abcdefg *.polket
 
for /D %%d in (*) do (
    cd %%d
    call :treeProcess
    cd ..
)
exit /b
