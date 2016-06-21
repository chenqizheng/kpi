#!/bin/sh
echo "Clear build dir..."
rm -rf build
mkdir build
name="kpitest"
mkdir build/$name

cp -R ` ls | grep -E -v "^(build*)"` "build/$name"
a="js"
for file in ` ls  $a | grep -v -E "jquery*"`
do
    if [ ! -d $a"/"$file ]
    then
         echo "build " $a"/"$file " to " "build/$name/$a/"$file
         java -jar /Users/Chen/Study/Study/JavaScript/tool/compiler-latest/compiler.jar --js $a"/"$file --js_output_file "build/$name/$a/"$file
    fi
done
echo "zipping"
cd build
zip -r $name.zip $name/*
echo "end"
